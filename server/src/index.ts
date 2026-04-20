import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import { dbPrimary, dbSecondary } from './db.js';
import { sql } from 'drizzle-orm';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8440;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';

// Initialize Database Tables
async function initDb() {
  try {
    await dbPrimary.execute(sql`
      CREATE TABLE IF NOT EXISTS user_login_logs (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        location VARCHAR(255) DEFAULT 'Unknown Location',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database initialized: user_login_logs table ready.');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}
initDb();

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SAKTI Analytical Platform API',
      version: '1.0.0',
      description: 'API Documentation for SAKTI Early Warning System backend. Connects to Primary (db_sakti) and Secondary (db_indonesiamonitoring) databases.',
    },
    servers: [
      {
        url: process.env.API_BASE_URL || `http://localhost:${port}/api`,
        description: 'Primary API Server',
      },
      {
        url: `http://localhost:${port}`,
        description: 'Development Local',
      },
    ],
  },
  apis: ['./src/index.ts'], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);


// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: [
    'http://84.247.145.144:8444',
    'http://localhost:5173',
    'http://localhost:5174'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// JWT Authentication Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Sesi kedaluwarsa, silakan login kembali' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Akses ditolak: Token tidak valid' });
    req.user = user;
    next();
  });
};

// Serve OpenAPI Specification for Scalar
app.get('/openapi.json', (req, res) => {
  res.json(swaggerDocs);
});



/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: Check backend and database connectivity
 *     description: Returns the connection status for both Primary and Secondary databases.
 *     responses:
 *       200:
 *         description: Both databases are reachable.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 databases:
 *                   type: object
 */
app.get('/api/health', async (req, res) => {
  try {
    // Test Primary DB
    const primaryRes = await dbPrimary.execute(sql`SELECT current_database(), current_user`);
    
    // Test Secondary DB
    const secondaryRes = await dbSecondary.execute(sql`SELECT current_database(), current_user`);

    // Check boundaries count
    const boundariesCount = await dbSecondary.execute(sql`SELECT COUNT(*)::int as count FROM region_indonesia_cities`);
    
    res.json({
      status: 'OK',
      databases: {
        primary: {
          connected: true,
          details: primaryRes.rows[0],
        },
        secondary: {
          connected: true,
          details: secondaryRes.rows[0],
          boundaries_ready: (boundariesCount.rows[0] as { count: number })?.count > 0,
          boundaries_count: (boundariesCount.rows[0] as { count: number })?.count
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

/**
 * @openapi
 * /api/metadata/secondary:
 *   get:
 *     summary: List tables in Secondary Database
 *     description: Fetches a list of all public tables from db_indonesiamonitoring.
 *     responses:
 *       200:
 *         description: A list of table names.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   table_name:
 *                     type: string
 */
app.get('/api/metadata/secondary', authenticateToken, async (req, res) => {
  try {
    const tables = await dbSecondary.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    res.json(tables.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/weather/cities:
 *   get:
 *     summary: List available cities for weather forecast
 *     description: Returns a sorted list of unique city names that have operational weather data.
 *     responses:
 *       200:
 *         description: A list of city names.
 */
app.get('/api/weather/cities', authenticateToken, async (req, res) => {
  try {
    const cities = await dbSecondary.execute(sql`
      SELECT DISTINCT city_name 
      FROM nasional_bmkg_weather_by_city 
      ORDER BY city_name ASC
    `);
    res.json(cities.rows.map(r => r.city_name));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/weather/forecast:
 *   get:
 *     summary: Get 7-day weather forecast for a city
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: "The name of the city (default: JAKARTA PUSAT)"
 *     responses:
 *       200:
 *         description: Detailed 7-day forecast and current stats.
 */
app.get('/api/weather/forecast', authenticateToken, async (req, res) => {
  const city = req.query.city || 'JAKARTA PUSAT';
  try {
    const forecast = await dbSecondary.execute(sql`
      SELECT * 
      FROM nasional_bmkg_weather_by_city 
      WHERE city_name = ${city}
      AND report_date >= CURRENT_DATE - INTERVAL '1 day'
      ORDER BY report_date ASC 
      LIMIT 10
    `);

    res.json({
      city,
      last_updated: new Date().toISOString(),
      forecast: forecast.rows
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/weather/provinces:
 *   get:
 *     summary: Get aggregated weather data for all provinces
 *     description: Returns current average weather stats for each province (region) based on recent data from all cities within that province.
 *     responses:
 *       200:
 *         description: Aggregated province data.
 */
app.get('/api/weather/provinces', async (req, res) => {
  try {
    const results = await dbSecondary.execute(sql`
      WITH latest_date AS (
        SELECT MAX(report_date) as max_date FROM nasional_bmkg_weather_by_city
      )
      SELECT 
        region_name as province,
        ROUND(AVG(temp_average::numeric), 1) as temp_avg,
        ROUND(AVG(humidity_average::numeric), 1) as humidity_avg,
        (
          SELECT condition 
          FROM nasional_bmkg_weather_by_city b2 
          WHERE b2.region_name = b1.region_name 
          AND b2.report_date = ld.max_date
          GROUP BY condition 
          ORDER BY COUNT(*) DESC, condition 
          LIMIT 1
        ) as dominant_condition,
        COUNT(city_name) as city_count
      FROM nasional_bmkg_weather_by_city b1, latest_date ld
      WHERE report_date = ld.max_date
      GROUP BY region_name, ld.max_date
      ORDER BY region_name ASC
    `);
    
    res.json(results.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/weather/map-cities:
 *   get:
 *     summary: Get latest weather data for all cities (Map View)
 *     description: Returns the most recent weather conditions, temperature, and humidity for every city in the database.
 *     responses:
 *       200:
 *         description: Array of city weather reports.
 */
app.get('/api/weather/map-cities', async (req, res) => {
  try {
    const results = await dbSecondary.execute(sql`
      WITH latest_weather AS (
        SELECT 
          city_name,
          region_name,
          report_date,
          condition,
          temp_average,
          humidity_average,
          ROW_NUMBER() OVER(PARTITION BY city_name ORDER BY report_date DESC) as rn
        FROM nasional_bmkg_weather_by_city
      )
      SELECT 
        city_name as city,
        region_name as province,
        report_date,
        condition,
        temp_average as temp,
        humidity_average as humidity
      FROM latest_weather
      WHERE rn = 1
      ORDER BY city_name ASC
    `);
    
    res.json(results.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/weather/boundaries:
 *   get:
 *     summary: Get GeoJSON boundaries for all Indonesian cities/regencies
 *     description: Returns a FeatureCollection derived from the region_indonesia_cities table in the secondary database.
 *     responses:
 *       200:
 *         description: GeoJSON FeatureCollection containing city boundaries.
 */
app.get('/api/weather/boundaries', async (req, res) => {
  try {
    const results = await dbSecondary.execute(sql`
      SELECT 
        gid_2,
        city_name as "name_2",
        province_name as "name_1",
        geometry
      FROM region_indonesia_cities
    `);
    
    const features = results.rows.map((row: any) => ({
      type: 'Feature',
      id: row.gid_2,
      properties: {
        NAME_1: row.name_1,
        NAME_2: row.name_2,
        GID_2: row.gid_2
      },
      geometry: typeof row.geometry === 'string' ? JSON.parse(row.geometry) : row.geometry
    }));

    res.json({
      type: 'FeatureCollection',
      features
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/bmkg/warnings:
 *   get:
 *     summary: Get latest BMKG disaster warnings
 *     description: Returns the most recent 10 disaster warnings (e.g., earthquakes) from the secondary database.
 *     responses:
 *       200:
 *         description: Array of BMKG warnings.
 */
app.get('/api/bmkg/warnings', authenticateToken, async (req, res) => {
  try {
    const results = await dbSecondary.execute(sql`
      SELECT 
        id, 
        warning_type, 
        warning_event, 
        warning_title, 
        warning_description, 
        additional_data, 
        created_at 
      FROM nasional_bmkg_warning_data 
      WHERE report_date = CURRENT_DATE
      ORDER BY created_at DESC 
      LIMIT 50
    `);
    res.json(results.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/analytics/kamtibmas-regions:
 *   get:
 *     summary: Get provinces with available Kamtibmas data for today
 *     responses:
 *       200:
 *         description: Array of province names.
 */
app.get('/api/analytics/kamtibmas-regions', authenticateToken, async (req, res) => {
  try {
    const results = await dbSecondary.execute(sql`
      SELECT DISTINCT region_name 
      FROM calculation_index_risiko 
      WHERE category ILIKE '%KAMTIBMAS%'
      AND report_date = CURRENT_DATE
      ORDER BY region_name ASC
    `);
    
    const regions = results.rows.map(r => r.region_name);
    res.json(['Nasional', ...regions]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/analytics/risk-scores:
 *   get:
 *     summary: Get live risk scores for all provinces
 *     description: Returns the latest calculated risk assessments for all provinces from the secondary database.
 *     responses:
 *       200:
 *         description: Array of risk score entries.
 */
app.get('/api/analytics/risk-scores', authenticateToken, async (req, res) => {
  try {
    const results = await dbSecondary.execute(sql`
      SELECT region_code, region_name, value, additional_data, report_date
      FROM calculation_index_risiko 
      WHERE category = 'index-risiko-provinsi'
      AND report_date = (SELECT MAX(report_date) FROM calculation_index_risiko WHERE category = 'index-risiko-provinsi')
      AND region_code != '100'
      ORDER BY value DESC
    `);
    res.json(results.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/analytics/risiko-detail:
 *   get:
 *     summary: Get granular risk details for a region (Inflation, Pangan, Kamtibmas, Sentiment)
 *     parameters:
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detailed risk metrics object.
 */
app.get('/api/analytics/risiko-detail', authenticateToken, async (req, res) => {
  const { region } = req.query;
  try {
    let q = '';
    let results: any;

    if (region) {
      results = await dbSecondary.execute(sql`
        WITH latest_date AS (
            SELECT MAX(report_date) as mdate 
            FROM calculation_index_risiko
            WHERE region_code = ${region}
              AND category IN ('index-risiko-provinsi', 'index-risiko-nasional')
        )
        SELECT category, additional_data, value
        FROM calculation_index_risiko, latest_date
        WHERE region_code = ${region}
          AND report_date = mdate
          AND category IN ('index-risiko-provinsi', 'index-risiko-nasional', 'skor-sentimen', 'skor-pangan-agregasi', 'skor-kamtibmas', 'skor-inflasi')
      `);

      if (results.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'No data' });
      }

      let details: any = {};
      const levels: any = {};

      for (const row of results.rows) {
        if (row.category === 'index-risiko-provinsi' || row.category === 'index-risiko-nasional') {
          details = row.additional_data || {};
        } else if (row.category === 'skor-inflasi') {
          const ad = row.additional_data || {};
          if (ad.mom_input !== undefined) details['Inflasi MoM (%)'] = ad.mom_input;
          if (ad.yoy_input !== undefined) details['Inflasi YoY (%)'] = ad.yoy_input;
          if (ad.level?.mom) levels['level_Inflasi MoM (%)'] = ad.level.mom;
          if (ad.level?.yoy) levels['level_Inflasi YoY (%)'] = ad.level.yoy;
        } else {
          const ad = row.additional_data || {};
          let levelStr = '';
          if (typeof ad.level === 'string') {
            levelStr = ad.level;
          } else if (ad.level && typeof ad.level.akhir === 'string') {
            levelStr = ad.level.akhir;
          }
          if (levelStr) {
            levels['level_' + row.category] = levelStr;
          }
        }
      }

      details = { ...details, ...levels };
      delete details['skor-inflasi'];

      return res.json({ success: true, details });
    } else {
      results = await dbSecondary.execute(sql`
        WITH latest_date AS (
            SELECT MAX(report_date) as mdate FROM calculation_index_risiko
            WHERE category IN ('index-risiko-provinsi', 'index-risiko-nasional')
        )
        SELECT 
            region_code, 
            region_name, 
            value,
            category
        FROM calculation_index_risiko, latest_date
        WHERE report_date = mdate
            AND category IN ('index-risiko-provinsi', 'index-risiko-nasional')
        ORDER BY (category = 'index-risiko-nasional') DESC, value DESC
      `);
      
      const list = results.rows.map((x: any) => {
        const score = Number(x.value) || 0;
        let status = 'Aman';
        if (score > 60) status = 'Bahaya';
        else if (score >= 35) status = 'Waspada';

        return {
          code: x.region_code,
          name: x.region_name,
          score,
          status
        };
      });
      return res.json({ success: true, list });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @openapi
 * /api/analytics/commodity-v3:
 *   get:
 *     summary: Get detailed commodity analysis (Top 12, Deviations, National Score)
 *     parameters:
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Commodity metrics and table data.
 */
app.get('/api/analytics/commodity-v3', authenticateToken, async (req, res) => {
  const { region: regionCode } = req.query;
  try {
    const targetFoods = [
      'beras-medium', 'beras-premium', 'bawang-merah', 'bawang-putih-honan',
      'cabai-merah-keriting', 'cabai-rawit-merah', 'daging-ayam-ras',
      'telur-ayam-ras', 'minyak-goreng-sawit-kemasan-premium', 'minyakita', 
      'minyak-goreng-sawit-curah', 'gula-pasir-curah'
    ];

    // 1. Fetch National Score
    const qNational = await dbSecondary.execute(sql`
      SELECT value FROM calculation_index_risiko
      WHERE category = 'skor-pangan-agregasi'
      AND ${regionCode ? sql`region_code = ${regionCode}` : sql`(LOWER(region_name) = 'nasional' OR region_code = '100')`}
      AND value > 0
      ORDER BY report_date DESC
      LIMIT 1
    `);
    const nationalScore = qNational.rows.length > 0 ? Number(qNational.rows[0].value) : null;

    // 2. Fetch ALL Commodities with Risks and Prices
    // We'll join with items from secondary db if they exist
    const qAllFoods = await dbSecondary.execute(sql`
      WITH latest_prices AS (
          ${regionCode ? sql`
              SELECT 
                  commodity_code, 
                  price as today_price, 
                  0 as gap_percentage,
                  report_date as today_date
              FROM nasional_commodity_sp2kp
              WHERE region_code = ${regionCode}
              AND report_date = (SELECT MAX(report_date) FROM nasional_commodity_sp2kp WHERE region_code = ${regionCode})
          ` : sql`
              SELECT 
                  commodity_code, 
                  AVG(price::numeric) as today_price, 
                  0 as gap_percentage,
                  MAX(report_date) as today_date
              FROM nasional_commodity_sp2kp
              WHERE report_date = (SELECT MAX(report_date) FROM nasional_commodity_sp2kp)
              GROUP BY commodity_code
          `}
      ),
      latest_risks AS (
          SELECT DISTINCT ON (category) 
              REPLACE(category, 'skor-pangan-', '') as commodity_code,
              value as risk_score
          FROM calculation_index_risiko
          WHERE category LIKE 'skor-pangan-%'
          AND category NOT IN ('skor-pangan-agregasi', 'skor-pangan-agregasi-nasional')
          AND ${regionCode ? sql`region_code = ${regionCode}` : sql`(LOWER(region_name) = 'nasional' OR region_code = '100')`}
          AND value > 0
          ORDER BY category, report_date DESC
      )
      SELECT 
          i.commodity_code as code,
          i.commodity_name as name,
          i.commodity_unit as unit,
          p.today_price as price,
          p.gap_percentage as change_pct,
          r.risk_score,
          (SELECT additional_data FROM calculation_index_risiko 
           WHERE category = 'skor-pangan-agregasi' 
           AND ${regionCode ? sql`region_code = ${regionCode}` : sql`(LOWER(region_name) = 'nasional' OR region_code = '100')`}
           ORDER BY report_date DESC LIMIT 1) as additional_data
      FROM nasional_commodity_items i
      LEFT JOIN latest_prices p ON i.commodity_code = p.commodity_code
      LEFT JOIN latest_risks r ON i.commodity_code = r.commodity_code
      WHERE i.source = 'sp2kp'
      ORDER BY r.risk_score DESC NULLS LAST
    `);

    const aggregationData = qAllFoods.rows.length > 0 && qAllFoods.rows[0].additional_data 
        ? qAllFoods.rows[0].additional_data 
        : null;

    const allItems = qAllFoods.rows.map((x: any) => {
        let price = Number(x.price) || 0;
        const riskCode = `skor-pangan-${x.code}`;
        if (x.additional_data && x.additional_data.commodities && x.additional_data.commodities[riskCode]) {
            const snapshottedPrice = x.additional_data.commodities[riskCode].today_price;
            if (snapshottedPrice > 0) price = Number(snapshottedPrice);
        }
        
        let baseline = 0;
        if (x.additional_data && x.additional_data.commodities && x.additional_data.commodities[riskCode]) {
            baseline = x.additional_data.commodities[riskCode].baseline_price || 0;
        }

        return {
            code: x.code,
            name: x.name,
            unit: x.unit,
            price: price,
            baseline: baseline,
            dev: baseline > 0 ? ((price - baseline) / baseline) * 100 : 0,
            riskScore: Number(x.risk_score) || 0
        };
    });

    const foodItems = allItems.filter((x: any) => targetFoods.includes(x.code));

    res.json({
        success: true,
        nationalScore: nationalScore,
        foodItems: foodItems,
        aggregationData: aggregationData
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @openapi
 * /api/analytics/ai-summary:
 *   get:
 *     summary: Get AI strategic analysis summaries for a region
 *     parameters:
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of AI analysis cards.
 */
app.get('/api/analytics/ai-summary', authenticateToken, async (req, res) => {
  const { region } = req.query;
  try {
    const defaultDateSubquery = sql`(SELECT MAX(report_date) FROM analysis_result_summaries)`;
    
    const results = await dbSecondary.execute(sql`
      SELECT 
          ars.issue_title,
          ars.issue_summary,
          ars.recommendation_analysis as recommendation,
          ars.impact_analysis as impact,
          ars.report_date as date,
          ars.region_code,
          ars.significance_score,
          ars.significance_scale
      FROM analysis_result_summaries ars
      WHERE ars.report_date = ${defaultDateSubquery}
      ${region ? sql`AND ars.region_code = ${region}` : sql``}
      ORDER BY ars.significance_score DESC, ars.issue_title ASC
    `);

    res.json(results.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/analytics/issues-all:
 *   get:
 *     summary: Get all trending issues across regions
 *     responses:
 *       200:
 *         description: List of trending issues with percentage and regional name.
 */
app.get('/api/analytics/issues-all', authenticateToken, async (req, res) => {
  const { date } = req.query;
  try {
    const results = await dbSecondary.execute(sql`
      WITH latest_date AS (
          SELECT MAX(report_date) as mdate FROM analysis_issue_lists
      )
      SELECT 
          p.region_name as province,
          l.issue_name as title,
          l.report_date as date,
          l.percentage,
          l.region_code
      FROM analysis_issue_lists l
      JOIN region_indonesia_provinces p ON l.region_code = p.region_code, latest_date
      WHERE l.report_date = ${date ? date : sql`latest_date.mdate`}
      ORDER BY l.percentage DESC
    `);
    
    const mapped = results.rows.map((x: any) => {
      const pct = Number(x.percentage) || 0;
      let status = 'Sedang';
      if (pct >= 89) status = 'Tinggi';
      else if (pct <= 50) status = 'Rendah';
      
      return { ...x, status };
    });

    res.json(mapped);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/analytics/kamtibmas-detail:
 *   get:
 *     summary: Get detailed Kamtibmas category breakdown (Kejahatan, Gangguan, etc.)
 *     parameters:
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Breakdown of security categories.
 */
app.get('/api/analytics/kamtibmas-detail', authenticateToken, async (req, res) => {
  const { region: regionIdentifier } = req.query;
  try {
    // 1. Get latest date/year available in the table
    const latestDateRes = await dbSecondary.execute(sql`SELECT MAX(report_date) as max_date, MAX(report_year) as m_year FROM nasional_kamtibmas_case_data`);
    const year = latestDateRes.rows[0].m_year || 2026;
    const targetDate = latestDateRes.rows[0].max_date;

    // 2. Query for categories with broad region matching
    // Note: We avoid direct numeric comparison with region_code to prevent 500 errors on string names
    const results = await dbSecondary.execute(sql`
      SELECT 
          LOWER(category) as cat,
          SUM(value) as total
      FROM nasional_kamtibmas_case_data
      WHERE report_year = ${year}
        AND LOWER(sub_category) = LOWER(category) || '_total'
        ${regionIdentifier ? sql`AND (
          LOWER(polda_name) = LOWER(${regionIdentifier}) 
          OR LOWER(polda_name) LIKE LOWER(${'%' + regionIdentifier + '%'})
          OR (CAST(region_code AS TEXT) = ${regionIdentifier})
        )` : sql``}
      GROUP BY LOWER(category)
    `);

    const categories: any = {};
    results.rows.forEach((row: any) => {
      categories[row.cat] = Number(row.total) || 0;
    });

    res.json({ categories, year, date: targetDate });
  } catch (error: any) {
    console.error('Kamtibmas Detail Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/analytics/sosmed-sentiment:
 *   get:
 *     summary: Get social media sentiment aggregation
 *     responses:
 *       200:
 *         description: Sentiment counts and percentages.
 */
app.get('/api/analytics/sosmed-sentiment', authenticateToken, async (req, res) => {
  const { date, region: regionCode } = req.query;
  
  // REGIONAL MODE: Fetch from news_items in dbSecondary
  if (regionCode) {
    try {
      const qStats = await dbSecondary.execute(sql`
        WITH target_date AS (
            SELECT MAX(report_date) as mdate FROM analysis_issue_lists
            WHERE region_code = ${regionCode}
        )
        SELECT 
            ni.news_sentiment as sentiment,
            COUNT(*) as count
        FROM news_items ni
        WHERE ni.news_id::text IN (
            SELECT DISTINCT jsonb_array_elements_text(news_idx)
            FROM analysis_issue_lists
            WHERE region_code = ${regionCode}
            AND report_date = (SELECT mdate FROM target_date)
        )
        AND ni.news_sentiment IS NOT NULL
        GROUP BY ni.news_sentiment
      `);

      const stats = { positive: 0, neutral: 0, negative: 0 };
      qStats.rows.forEach((row: any) => {
        const s = (row.sentiment || '').toLowerCase();
        const count = Number(row.count);
        if (s.includes('positi')) stats.positive += count;
        else if (s.includes('negati')) stats.negative += count;
        else if (s.includes('netral') || s.includes('neutral')) stats.neutral += count;
      });

      const qNews = await dbSecondary.execute(sql`
        WITH target_date AS (
            SELECT MAX(report_date) as mdate FROM analysis_issue_lists
            WHERE region_code = ${regionCode}
        )
        SELECT 
            ni.news_id::text as news_id,
            ni.news_title as title,
            ni.news_url as url,
            ni.news_domain as source,
            ni.news_sentiment as sentiment,
            ni.published_at,
            ni.news_snippet as snippet
        FROM news_items ni
        JOIN (
            SELECT DISTINCT jsonb_array_elements_text(news_idx) as news_id
            FROM analysis_issue_lists
            WHERE region_code = ${regionCode}
            AND report_date = (SELECT mdate FROM target_date)
        ) ln ON ni.news_id::text = ln.news_id
        ORDER BY ni.published_at DESC
        LIMIT 5
      `);

      return res.json({
        success: true,
        data: {
          news: qNews.rows,
          stats: stats
        }
      });
    } catch (e: any) {
      console.error('[API] Region sentiment error:', e);
      // Fallback to sample logic below if regional fails or return empty
    }
  }

  try {
    let targetDate: any = date;
    if (!targetDate) {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      // Check Today
      const checkToday = await dbPrimary.execute(sql`SELECT 1 FROM sample_sosmed_post_data WHERE post_timestamp::date = ${today} LIMIT 1`);
      if (checkToday.rows.length > 0) {
        targetDate = today;
      } else {
        // Check Yesterday
        const checkYesterday = await dbPrimary.execute(sql`SELECT 1 FROM sample_sosmed_post_data WHERE post_timestamp::date = ${yesterday} LIMIT 1`);
        if (checkYesterday.rows.length > 0) {
          targetDate = yesterday;
        } else {
          // Fallback to absolute latest
          const latestDateRes = await dbPrimary.execute(sql`SELECT MAX(post_timestamp::date) as max_d FROM sample_sosmed_post_data`);
          targetDate = latestDateRes.rows[0].max_d;
        }
      }
    }

    if (!targetDate) {
      return res.json({ total: 0, stats: [], last_update: null, keyword_count: 0, keywords: [], filtered_date: null });
    }

    // Ensure targetDate is a string (YYYY-MM-DD)
    const formattedDate = typeof targetDate === 'string' ? targetDate : new Date(targetDate).toISOString().split('T')[0];

    const results = await dbPrimary.execute(sql`
      SELECT 
        sentiment, 
        COUNT(*)::int as count
      FROM sample_sosmed_post_data 
      WHERE post_timestamp::date = ${formattedDate}::date
      GROUP BY sentiment
      ORDER BY count DESC
    `);
    
    const latestTimestampRes = await dbPrimary.execute(sql`
      SELECT MAX(created_at) as last_update 
      FROM sample_sosmed_post_data 
      WHERE post_timestamp::date = ${formattedDate}::date
    `);
    const lastUpdate = latestTimestampRes.rows[0].last_update;

    // Get keyword count and list for the date
    const keywordRes = await dbPrimary.execute(sql`
      SELECT COUNT(DISTINCT keyword)::int as kw_count 
      FROM sample_sosmed_post_data 
      WHERE post_timestamp::date = ${formattedDate}::date
    `);
    const keywordCount = keywordRes.rows[0].kw_count;

    const keywordListRes = await dbPrimary.execute(sql`
      SELECT DISTINCT keyword 
      FROM sample_sosmed_post_data 
      WHERE post_timestamp::date = ${formattedDate}::date
      AND keyword IS NOT NULL
      ORDER BY keyword ASC
    `);
    const keywords = (keywordListRes.rows as { keyword: string }[]).map(r => r.keyword);

    const rows = results.rows as { sentiment: string, count: number }[];
    const total = rows.reduce((sum, r) => sum + r.count, 0);
    
    const stats = rows.map(r => ({
      sentiment: r.sentiment,
      count: r.count,
      percentage: total > 0 ? parseFloat(((r.count / total) * 100).toFixed(2)) : 0
    }));

    res.json({
      total,
      stats,
      last_update: lastUpdate,
      keyword_count: keywordCount,
      keywords: keywords,
      filtered_date: formattedDate
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/osint/summary:
 *   get:
 *     summary: Get overall OSINT metrics and platform distribution
 */
app.get('/api/osint/summary', authenticateToken, async (req, res) => {
    const { startDate, endDate, keyword, platform } = req.query;
    try {
    const latestDateRes = await dbPrimary.execute(sql`SELECT MAX(post_timestamp::date) as max_d FROM sample_sosmed_post_data`);
    const defaultDate = latestDateRes.rows[0].max_d;
    
    const sDate = startDate || defaultDate;
    const eDate = endDate || startDate || defaultDate;

    if (!sDate) return res.json({ platforms: [], keywords: [] });

    let whereClauseBase = sql`WHERE post_timestamp::date BETWEEN ${sDate}::date AND ${eDate}::date`;
    
    if (platform && platform !== 'All') {
      whereClauseBase = sql`${whereClauseBase} AND post_source ILIKE ${platform as string}`;
    }

    let whereClauseFiltered = whereClauseBase;

    if (keyword && keyword !== 'All') {
      const keywords = (keyword as string).split(',');
      const inParams = keywords.map(k => sql`${k}`);
      whereClauseFiltered = sql`${whereClauseBase} AND keyword IN (${sql.join(inParams, sql`, `)})`;
    }

    const platformRes = await dbPrimary.execute(sql`
      SELECT 
        post_source as platform, 
        COUNT(*)::int as count,
        COUNT(CASE WHEN sentiment = 'Positif' THEN 1 END)::int as pos_count,
        COUNT(CASE WHEN sentiment = 'Negatif' THEN 1 END)::int as neg_count
      FROM sample_sosmed_post_data 
      ${whereClauseFiltered}
      GROUP BY post_source 
      ORDER BY count DESC
    `);

    // Calculate previous period for growth comparison (spike)
    const start = new Date(sDate as string);
    const end = new Date(eDate as string);
    const duration = end.getTime() - start.getTime() + (24 * 60 * 60 * 1000);
    const pSDate = new Date(start.getTime() - duration).toISOString().split('T')[0];
    const pEDate = new Date(start.getTime() - (24 * 60 * 60 * 1000)).toISOString().split('T')[0];

    // Build common filter for keywords (Current & Previous)
    const platformFilter = platform && platform !== 'All' ? sql`AND post_source ILIKE ${platform as string}` : sql``;

    const keywordRes = await dbPrimary.execute(sql`
      WITH current_data AS (
        SELECT keyword, 
               COUNT(*)::int as volume,
               COUNT(CASE WHEN sentiment = 'Negatif' THEN 1 END)::int as neg_count,
               COUNT(CASE WHEN sentiment = 'Positif' THEN 1 END)::int as pos_count,
               COUNT(CASE WHEN sentiment = 'Netral' THEN 1 END)::int as neut_count,
               ARRAY_AGG(DISTINCT post_source) as platforms
        FROM sample_sosmed_post_data 
        WHERE post_timestamp::date BETWEEN ${sDate}::date AND ${eDate}::date
        ${platformFilter}
        GROUP BY keyword
      ),
      previous_data AS (
        SELECT keyword, COUNT(*)::int as prev_volume
        FROM sample_sosmed_post_data 
        WHERE post_timestamp::date BETWEEN ${pSDate}::date AND ${pEDate}::date
        ${platformFilter}
        GROUP BY keyword
      )
      SELECT c.*, 
             COALESCE(p.prev_volume, 0) as prev_volume,
             CASE 
               WHEN COALESCE(p.prev_volume, 0) = 0 THEN 500
               ELSE ((c.volume - p.prev_volume)::float / p.prev_volume * 100)::int 
             END as spike
      FROM current_data c
      LEFT JOIN previous_data p ON c.keyword = p.keyword
      ORDER BY c.volume DESC 
      LIMIT 10
    `);

    const keywords = keywordRes.rows;

    const emotionRes = await dbPrimary.execute(sql`
      SELECT emotion, COUNT(*)::int as count
      FROM sample_sosmed_post_data 
      ${whereClauseFiltered}
      AND emotion IS NOT NULL
      GROUP BY emotion
    `);

    const emotions = {
      anger: 0,
      fear: 0,
      sadness: 0,
      joy: 0,
      surprise: 0
    };

    emotionRes.rows.forEach((row: any) => {
      const val = (row.emotion || '').toLowerCase().trim();
      
      // Multi-lingual mapping (Indonesian & English)
      if (val.includes('anger') || val.includes('marah') || val.includes('geram') || val.includes('kesal')) {
        emotions.anger += row.count;
      } else if (val.includes('fear') || val.includes('takut') || val.includes('khawatir') || val.includes('cemas')) {
        emotions.fear += row.count;
      } else if (val.includes('sadness') || val.includes('sad') || val.includes('sedih') || val.includes('duka') || val.includes('kecewa')) {
        emotions.sadness += row.count;
      } else if (val.includes('joy') || val.includes('happy') || val.includes('senang') || val.includes('bahagia') || val.includes('gembira')) {
        emotions.joy += row.count;
      } else if (val.includes('surprise') || val.includes('kaget') || val.includes('terkejut')) {
        emotions.surprise += row.count;
      }
    });

    res.json({
      startDate: sDate,
      endDate: eDate,
      platforms: platformRes.rows,
      keywords: keywords,
      emotions: emotions,
      rawEmotions: emotionRes.rows // Debugging raw database values
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/osint/sentiment-trend:
 *   get:
 *     summary: Get sentiment distribution over time for charting
 */
app.get('/api/osint/sentiment-trend', authenticateToken, async (req, res) => {
    const { startDate, endDate, keyword, platform } = req.query;
    try {
    const latestDateRes = await dbPrimary.execute(sql`SELECT MAX(post_timestamp::date) as max_d FROM sample_sosmed_post_data`);
    const defaultDate = latestDateRes.rows[0].max_d;
    
    const sDate = startDate || defaultDate;
    const eDate = endDate || startDate || defaultDate;

    if (!sDate) return res.json([]);

    let whereClause = sql`WHERE post_timestamp::date BETWEEN ${sDate}::date AND ${eDate}::date`;
    
    if (platform && platform !== 'All') {
      whereClause = sql`${whereClause} AND post_source ILIKE ${platform as string}`;
    }

    if (keyword && keyword !== 'All') {
      const keywords = (keyword as string).split(',');
      const inParams = keywords.map(k => sql`${k}`);
      whereClause = sql`${whereClause} AND keyword IN (${sql.join(inParams, sql`, `)})`;
    }

    const trendRes = await dbPrimary.execute(sql`
      SELECT 
        date_trunc('hour', post_timestamp) as hour,
        COUNT(CASE WHEN sentiment = 'Positif' THEN 1 END)::int as pos,
        COUNT(CASE WHEN sentiment = 'Negatif' THEN 1 END)::int as neg,
        COUNT(CASE WHEN sentiment = 'Netral' THEN 1 END)::int as neut
      FROM sample_sosmed_post_data 
      ${whereClause}
      GROUP BY hour 
      ORDER BY hour ASC
    `);

    res.json(trendRes.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/osint/posts:
 *   get:
 *     summary: Get paginated post feed for live monitoring
 */
app.get('/api/osint/posts', authenticateToken, async (req, res) => {
    const { startDate, endDate, limit = 50, page = 1, sentiment, keyword, platform, search } = req.query;
    try {
    const latestDateRes = await dbPrimary.execute(sql`SELECT MAX(post_timestamp::date) as max_d FROM sample_sosmed_post_data`);
    const defaultDate = latestDateRes.rows[0].max_d;
    
    const sDate = startDate || defaultDate;
    const eDate = endDate || startDate || defaultDate;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = sql`WHERE post_timestamp::date BETWEEN ${sDate}::date AND ${eDate}::date`;
    if (sentiment && sentiment !== 'All') whereClause = sql`${whereClause} AND sentiment = ${sentiment as string}`;
    if (platform && platform !== 'All') whereClause = sql`${whereClause} AND post_source ILIKE ${platform as string}`;
    if (search) whereClause = sql`${whereClause} AND post_author ILIKE ${'%' + (search as string) + '%'}`;
    if (keyword && keyword !== 'All') {
      const keywords = (keyword as string).split(',');
      const inParams = keywords.map(k => sql`${k}`);
      whereClause = sql`${whereClause} AND keyword IN (${sql.join(inParams, sql`, `)})`;
    }

    const postsRes = await dbPrimary.execute(sql`
      SELECT id, post_author as username, post_content, post_source as platform, sentiment, post_timestamp, keyword
      FROM sample_sosmed_post_data 
      ${whereClause}
      ORDER BY post_timestamp DESC
    `);

    res.json(postsRes.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/osint/network:
 *   get:
 *     summary: Get interaction network data (authors and keywords)
 */
app.get('/api/osint/network', authenticateToken, async (req, res) => {
    const { startDate, endDate, sentiment, keyword, platform, limit = 1000 } = req.query;
    try {
    const L = Math.min(3000, Number(limit));
    const authorsLimit = Math.floor(L * 0.6);
    const hashtagsLimit = Math.floor(L * 0.3);
    const keywordsLimit = Math.max(20, Math.floor(L * 0.1));
    const latestDateRes = await dbPrimary.execute(sql`SELECT MAX(post_timestamp::date) as max_d FROM sample_sosmed_post_data`);
    const defaultDate = latestDateRes.rows[0].max_d;
    
    const sDate = startDate || defaultDate;
    const eDate = endDate || startDate || defaultDate;

    if (!sDate) return res.json({ nodes: [], links: [] });

    let whereClause = sql`WHERE p.post_timestamp::date BETWEEN ${sDate}::date AND ${eDate}::date`;
    
    if (sentiment && sentiment !== 'All') {
      whereClause = sql`${whereClause} AND p.sentiment = ${sentiment as string}`;
    }

    if (platform && platform !== 'All') {
      whereClause = sql`${whereClause} AND p.post_source ILIKE ${platform as string}`;
    }

    if (keyword && keyword !== 'All') {
      const keywords = (keyword as string).split(',');
      const inParams = keywords.map(k => sql`${k}`);
      whereClause = sql`${whereClause} AND p.keyword IN (${sql.join(inParams, sql`, `)})`;
    }

    // 1. Get Top Authors (Primaries) - Limit to 100 for performance
    const authorsRes = await dbPrimary.execute(sql`
      SELECT 
        post_author as id, 
        SUM(COALESCE(likes_count,0) + COALESCE(comment_count,0) + COALESCE(share_count,0) + COALESCE(retweet_count,0))::int + 10 as val,
        'user' as type
      FROM sample_sosmed_post_data p
      ${whereClause}
      GROUP BY post_author 
      ORDER BY val DESC 
      LIMIT ${authorsLimit}
    `);

    // 2. Get All Active Keywords in this period
    const keywordsRes = await dbPrimary.execute(sql`
      SELECT 
        p.keyword as id, 
        (COUNT(p.id)::int * 5) + 30 as val, 
        'keyword' as type
      FROM sample_sosmed_post_data p
      ${whereClause}
      GROUP BY p.keyword 
      ORDER BY val DESC 
      LIMIT ${keywordsLimit}
    `);

    // 3. Get Top Hashtags for this period
    const hashtagRes = await dbPrimary.execute(sql`
      SELECT 
        h.tag as id,
        COUNT(h.id)::int * 3 + 10 as val,
        'hashtag' as type
      FROM sample_sosmed_hashtag_data h
      JOIN sample_sosmed_post_data p ON h.post_code = p.post_code
      ${whereClause}
      GROUP BY h.tag
      ORDER BY val DESC
      LIMIT ${hashtagsLimit}
    `);

    const nodesMap = new Map();
    authorsRes.rows.forEach(r => nodesMap.set(r.id, r));
    keywordsRes.rows.forEach(r => nodesMap.set(r.id, r));
    hashtagRes.rows.forEach(r => nodesMap.set(r.id, r));

    // 4. Extract Links (Keyword + Mentions + Hashtags)
    const rawPosts = await dbPrimary.execute(sql`
      SELECT p.post_code, p.post_author, p.post_content, p.keyword, h.tag as hashtag
      FROM sample_sosmed_post_data p
      LEFT JOIN sample_sosmed_hashtag_data h ON p.post_code = h.post_code
      ${whereClause}
      LIMIT ${L * 3}
    `);

    const links: any[] = [];
    const linkKeys = new Set();

    rawPosts.rows.forEach((post: any) => {
      // User-Keyword Link
      if (post.keyword && nodesMap.has(post.keyword) && nodesMap.has(post.post_author)) {
        const key = `k:${post.post_author}->${post.keyword}`;
        if (!linkKeys.has(key)) {
          links.push({ source: post.post_author, target: post.keyword, value: 5 });
          linkKeys.add(key);
        }
      }

      // User-Hashtag Link
      if (post.hashtag && nodesMap.has(post.hashtag) && nodesMap.has(post.post_author)) {
        const key = `h:${post.post_author}->${post.hashtag}`;
        if (!linkKeys.has(key)) {
          links.push({ source: post.post_author, target: post.hashtag, value: 3 });
          linkKeys.add(key);
        }
      }

      // User-User (Mention) Link logic remains as it scans content for on-the-fly links
      const content = String(post.post_content || '');
      const mentions = content.match(/@(\w+)/g);
      if (mentions) {
        mentions.forEach((m: string) => {
          const targetUser = m.replace('@', '');
          if (targetUser === post.post_author) return;

          // Only link to authors we already have to prevent unlinked star-bursts in 7d view
          if (nodesMap.has(post.post_author)) {
             if (!nodesMap.has(targetUser)) {
               nodesMap.set(targetUser, { id: targetUser, val: 5, type: 'user' });
             }
             const key = `m:${post.post_author}->${targetUser}`;
             if (!linkKeys.has(key)) {
               links.push({ source: post.post_author, target: targetUser, value: 2 });
               linkKeys.add(key);
             }
          }
        });
      }
    });
    res.json({ 
      nodes: Array.from(nodesMap.values()), 
      links: links 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
/**
 * @openapi
 * /api/analytics/food-risk:
 *   get:
 *     summary: Get live food risk scores (aggregated)
 */
app.get('/api/analytics/food-risk', authenticateToken, async (req, res) => {
  try {
    const results = await dbSecondary.execute(sql`
      SELECT region_name, value, additional_data, report_date
      FROM calculation_index_risiko 
      WHERE category = 'skor-pangan-agregasi'
      AND report_date = (SELECT MAX(report_date) FROM calculation_index_risiko WHERE category = 'skor-pangan-agregasi')
      ORDER BY value DESC
    `);
    res.json(results.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/analytics/disaster-history:
 *   get:
 *     summary: Get latest disaster history logs from BNPB data
 */
app.get('/api/analytics/disaster-history', authenticateToken, async (req, res) => {
  const { province, category, start_date, end_date, limit = 50 } = req.query;
  try {
    let query = sql`
      SELECT id, report_date, region_name as province_name, city_name, event as category, 
             location, cause, total_meninggal, total_hilang, total_terluka, 
             total_rumah_rusak, total_rumah_terendam, total_fasum_rusak, 
             created_at
      FROM sample_bnpb_bencana_data 
      WHERE 1=1
    `;

    if (start_date) {
      query = sql`${query} AND report_date >= ${start_date as string}`;
    } else {
      query = sql`${query} AND report_date >= CURRENT_DATE - INTERVAL '1 month'`;
    }

    if (end_date) {
      query = sql`${query} AND report_date <= ${end_date as string}`;
    }

    if (province && province !== 'Nasional') {
      query = sql`${query} AND region_name = ${province as string}`;
    }
    if (category && category !== 'Semua') {
      query = sql`${query} AND event = ${category as string}`;
    }

    query = sql`${query} ORDER BY report_date DESC LIMIT ${Number(limit)}`;

    const results = await dbPrimary.execute(query);
    res.json(results.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/analytics/disaster-stats:
 *   get:
 *     summary: Get aggregated disaster statistics
 */
app.get('/api/analytics/disaster-stats', authenticateToken, async (req, res) => {
  const { province, category, start_date, end_date } = req.query;
  try {
    let query = sql`
      SELECT 
        COALESCE(SUM(total_meninggal), 0) as deaths,
        COALESCE(SUM(total_hilang), 0) as missing,
        COALESCE(SUM(total_terluka), 0) as injured,
        COALESCE(SUM(total_rumah_rusak + total_rumah_terendam), 0) as damage,
        COUNT(*) as total_events
      FROM sample_bnpb_bencana_data
      WHERE 1=1
    `;

    if (start_date) {
      query = sql`${query} AND report_date >= ${start_date as string}`;
    } else {
      query = sql`${query} AND report_date >= CURRENT_DATE - INTERVAL '1 month'`;
    }

    if (end_date) {
      query = sql`${query} AND report_date <= ${end_date as string}`;
    }

    if (province && province !== 'Nasional') {
      query = sql`${query} AND region_name = ${province as string}`;
    }

    if (category && category !== 'Semua') {
      query = sql`${query} AND event = ${category as string}`;
    }

    const results = await dbPrimary.execute(query);
    res.json(results.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/analytics/traffic-accidents:
 *   get:
 *     summary: Get detailed traffic accident records (Last 3 Days default)
 */
app.get('/api/analytics/traffic-accidents', authenticateToken, async (req, res) => {
  const { province, injury_status, victim_status, polres, start_date, search, limit = 50, page = 1 } = req.query;
  try {
    const startDateVal = start_date ? String(start_date) : null;
    const endDateVal = req.query.end_date ? String(req.query.end_date) : null;
    const offset = (Number(page) - 1) * Number(limit);
    const searchVal = search ? `%${String(search)}%` : null;
    
    let query = sql`
      WITH latest AS (SELECT MAX(accident_date) as max_d FROM sample_polisi_kecelakaan_data)
      SELECT p.* 
      FROM sample_polisi_kecelakaan_data p, latest l
      WHERE p.accident_date >= COALESCE(${startDateVal}::date, l.max_d - INTERVAL '3 days')
    `;

    if (endDateVal) {
      query = sql`${query} AND p.accident_date <= ${endDateVal}::date`;
    }
    if (province && province !== 'Nasional') {
      query = sql`${query} AND p.region_name = ${province as string}`;
    }
    if (injury_status !== undefined && injury_status !== 'Semua') {
      query = sql`${query} AND p.injury_status = ${injury_status as string}`;
    }
    if (victim_status && victim_status !== 'Semua') {
      query = sql`${query} AND p.victim_status = ${victim_status as string}`;
    }
    if (polres && polres !== 'Semua') {
      query = sql`${query} AND p.polres = ${polres as string}`;
    }
    if (searchVal) {
      query = sql`${query} AND (
        p.victim_name ILIKE ${searchVal} OR 
        p.city_name ILIKE ${searchVal} OR 
        p.polres ILIKE ${searchVal} OR 
        p.report_number ILIKE ${searchVal}
      )`;
    }

    // Get Data
    const dataQuery = sql`${query} ORDER BY p.accident_date DESC LIMIT ${Number(limit)} OFFSET ${offset}`;
    const results = await dbPrimary.execute(dataQuery);

    // Get Total Count for Pagination
    const countQuery = sql`
      WITH latest AS (SELECT MAX(accident_date) as max_d FROM sample_polisi_kecelakaan_data)
      SELECT COUNT(*)::int as total
      FROM sample_polisi_kecelakaan_data p, latest l
      WHERE p.accident_date >= COALESCE(${startDateVal}::date, l.max_d - INTERVAL '3 days')
      ${endDateVal ? sql` AND p.accident_date <= ${endDateVal}::date` : sql``}
      ${province && province !== 'Nasional' ? sql` AND p.region_name = ${province as string}` : sql``}
      ${injury_status !== undefined && injury_status !== 'Semua' ? sql` AND p.injury_status = ${injury_status as string}` : sql``}
      ${victim_status && victim_status !== 'Semua' ? sql` AND p.victim_status = ${victim_status as string}` : sql``}
      ${polres && polres !== 'Semua' ? sql` AND p.polres = ${polres as string}` : sql``}
      ${searchVal ? sql` AND (p.victim_name ILIKE ${searchVal} OR p.city_name ILIKE ${searchVal} OR p.polres ILIKE ${searchVal} OR p.report_number ILIKE ${searchVal})` : sql``}
    `;
    const countRes = await dbPrimary.execute(countQuery);
    const total = countRes.rows[0].total as number;

    res.json({
      data: results.rows,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Traffic accidents error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/analytics/traffic-accident-stats:
 *   get:
 *     summary: Get aggregated traffic accident statistics (Last 7 Days default)
 */
app.get('/api/analytics/traffic-accident-stats', authenticateToken, async (req, res) => {
  const { province, start_date } = req.query;
  try {
    const startDateVal = start_date ? String(start_date) : null;
    const endDateVal = req.query.end_date ? String(req.query.end_date) : null;

    let query = sql`
      WITH latest AS (SELECT MAX(accident_date) as max_d FROM sample_polisi_kecelakaan_data)
      SELECT 
        l.max_d as latest_date,
        COUNT(*)::int as total,
        COUNT(CASE WHEN injury_status = 'MD' THEN 1 END)::int as fatal,
        COUNT(CASE WHEN injury_status IN ('LL', 'LB', 'LR') THEN 1 END)::int as light,
        COUNT(CASE WHEN injury_status = '' OR injury_status IS NULL THEN 1 END)::int as heavy
      FROM sample_polisi_kecelakaan_data p, latest l
      WHERE p.accident_date >= COALESCE(${startDateVal}::date, l.max_d - INTERVAL '7 days')
    `;

    if (endDateVal) {
      query = sql`${query} AND p.accident_date <= ${endDateVal}::date`;
    }
    if (province && province !== 'Nasional') {
      query = sql`${query} AND p.region_name = ${province as string}`;
    }

    const finalQuery = sql`${query} GROUP BY l.max_d`;
    const results = await dbPrimary.execute(finalQuery);
    res.json(results.rows[0]);
  } catch (error: any) {
    console.error('Traffic stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/analytics/kamtibmas-national-stats:
 *   get:
 *     summary: Get national Kamtibmas totals for today and yesterday
 *     responses:
 *       200:
 *         description: Object containing today and yesterday totals + trend.
 */
app.get('/api/analytics/kamtibmas-national-stats', authenticateToken, async (req, res) => {
  try {
    const latestDateRes = await dbSecondary.execute(sql`SELECT MAX(report_date) as max_date FROM nasional_kamtibmas_case_data`);
    const maxDate = latestDateRes.rows[0].max_date as string;
    
    if (!maxDate) {
      return res.json({ today: 0, yesterday: 0, trend_pct: 0 });
    }

    const prevDateRes = await dbSecondary.execute(sql`
      SELECT MAX(report_date) as prev_date 
      FROM nasional_kamtibmas_case_data 
      WHERE report_date < ${maxDate}
    `);
    const prevDate = prevDateRes.rows[0].prev_date as string;

    const results = await dbSecondary.execute(sql`
      WITH daily_stats AS (
        SELECT 
          report_date,
          SUM(value) as daily_total
        FROM nasional_kamtibmas_case_data
        WHERE sub_category IN ('kejahatan_total', 'gangguan_total', 'pelanggaran_total', 'bencana_total')
        AND report_date IN (${maxDate}, ${prevDate})
        GROUP BY report_date
      )
      SELECT 
        (SELECT daily_total FROM daily_stats WHERE report_date = ${maxDate}) as today,
        (SELECT daily_total FROM daily_stats WHERE report_date = ${prevDate}) as yesterday
    `);
    
    const row = results.rows[0] as any;
    const today = Number(row.today || 0);
    const yesterday = Number(row.yesterday || 0);
    
    let trend_pct = 0;
    if (yesterday > 0) {
      trend_pct = ((today - yesterday) / yesterday) * 100;
    } else if (today > 0) {
      trend_pct = 100;
    }
    
    res.json({
      today,
      yesterday,
      trend_pct,
      date: maxDate
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/kamtibmas/polda-list:
 *   get:
 *     summary: Get list of all available Polda
 */
app.get('/api/kamtibmas/polda-list', authenticateToken, async (req, res) => {
  try {
    const results = await dbSecondary.execute(sql`
      SELECT DISTINCT polda_name 
      FROM nasional_kamtibmas_case_data 
      ORDER BY polda_name ASC
    `);
    res.json(results.rows.map(r => r.polda_name));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/kamtibmas/classifications:
 *   get:
 *     summary: Get list of all available crime classifications
 */
app.get('/api/kamtibmas/classifications', authenticateToken, async (req, res) => {
  try {
    const results = await dbSecondary.execute(sql`
      SELECT DISTINCT sub_category 
      FROM nasional_kamtibmas_case_data 
      WHERE sub_category NOT IN ('kejahatan_total', 'bencana_total', 'gangguan_total', 'pelanggaran_total')
      ORDER BY sub_category ASC
    `);
    res.json(results.rows.map(r => r.sub_category));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/kamtibmas/stats:
 *   get:
 *     summary: Get detailed Kamtibmas statistics for dashboard cards
 */
app.get('/api/kamtibmas/stats', authenticateToken, async (req, res) => {
  const polda = req.query.polda;
  const dateStr = req.query.date;
  
  try {
    const whereClause = polda ? sql`AND polda_name = ${polda}` : sql``;
    
    // Determine the target date
    let targetDateValue;
    if (dateStr) {
      targetDateValue = dateStr;
    } else {
      const latestDateRes = await dbSecondary.execute(sql`SELECT MAX(report_date) as d FROM nasional_kamtibmas_case_data`);
      targetDateValue = latestDateRes.rows[0].d;
    }

    if (!targetDateValue) {
      return res.json({ total_kamtibmas: 0, total_kejahatan: 0, total_demo: 0, total_massa: 0, date: 'N/A' });
    }

    const results = await dbSecondary.execute(sql`
      SELECT 
        (
          SELECT SUM(CASE WHEN sub_category IN ('kejahatan_total', 'gangguan_total', 'pelanggaran_total', 'bencana_total') THEN value ELSE 0 END)
          FROM nasional_kamtibmas_case_data
          WHERE report_date >= (${targetDateValue}::date - INTERVAL '2 days') 
            AND report_date <= ${targetDateValue}::date ${whereClause}
        ) as total_kamtibmas,
        (
          SELECT SUM(CASE WHEN sub_category = 'kejahatan_total' THEN value ELSE 0 END)
          FROM nasional_kamtibmas_case_data
          WHERE report_date >= (${targetDateValue}::date - INTERVAL '2 days') 
            AND report_date <= ${targetDateValue}::date ${whereClause}
        ) as total_kejahatan,
        (
          SELECT SUM(CASE WHEN sub_category = 'kejahatan_konvensional' THEN value ELSE 0 END)
          FROM nasional_kamtibmas_case_data
          WHERE report_date >= (${targetDateValue}::date - INTERVAL '2 days') 
            AND report_date <= ${targetDateValue}::date ${whereClause}
        ) as konvensional,
        (
          SELECT SUM(CASE WHEN sub_category = 'kejahatan_transnasional' THEN value ELSE 0 END)
          FROM nasional_kamtibmas_case_data
          WHERE report_date >= (${targetDateValue}::date - INTERVAL '2 days') 
            AND report_date <= ${targetDateValue}::date ${whereClause}
        ) as transnasional,
        (
          SELECT SUM(CASE WHEN sub_category = 'kejahatan_kekayaan_negara' THEN value ELSE 0 END)
          FROM nasional_kamtibmas_case_data
          WHERE report_date >= (${targetDateValue}::date - INTERVAL '2 days') 
            AND report_date <= ${targetDateValue}::date ${whereClause}
        ) as kekayaan_negara,
        (
          SELECT SUM(CASE WHEN sub_category = 'pelanggaran_total' THEN value ELSE 0 END)
          FROM nasional_kamtibmas_case_data
          WHERE report_date >= (${targetDateValue}::date - INTERVAL '2 days') 
            AND report_date <= ${targetDateValue}::date ${whereClause}
        ) as pelanggaran,
        (
          SELECT SUM(CASE WHEN category = 'total_unjuk_rasa' THEN value ELSE 0 END)
          FROM nasional_kamtibmas_unjuk_rasa_data
          WHERE report_date >= (${targetDateValue}::date - INTERVAL '2 days') 
            AND report_date <= ${targetDateValue}::date
          ${polda ? sql`AND polda_name = ${polda}` : sql``}
        ) as total_demo,
        (
          SELECT SUM(CASE WHEN category = 'total_massa' THEN value ELSE 0 END)
          FROM nasional_kamtibmas_unjuk_rasa_data
          WHERE report_date >= (${targetDateValue}::date - INTERVAL '2 days') 
            AND report_date <= ${targetDateValue}::date
          ${polda ? sql`AND polda_name = ${polda}` : sql``}
        ) as total_massa,
        (
          SELECT SUM(CASE WHEN category = 'total_pam_polri' THEN value ELSE 0 END)
          FROM nasional_kamtibmas_unjuk_rasa_data
          WHERE report_date >= (${targetDateValue}::date - INTERVAL '2 days') 
            AND report_date <= ${targetDateValue}::date
          ${polda ? sql`AND polda_name = ${polda}` : sql``}
        ) as pam_polri,
        (
          SELECT SUM(CASE WHEN category = 'total_pam_tni' THEN value ELSE 0 END)
          FROM nasional_kamtibmas_unjuk_rasa_data
          WHERE report_date >= (${targetDateValue}::date - INTERVAL '2 days') 
            AND report_date <= ${targetDateValue}::date
          ${polda ? sql`AND polda_name = ${polda}` : sql``}
        ) as pam_tni,
        (
          SELECT SUM(CASE WHEN category = 'total_pam_lainnya' THEN value ELSE 0 END)
          FROM nasional_kamtibmas_unjuk_rasa_data
          WHERE report_date >= (${targetDateValue}::date - INTERVAL '2 days') 
            AND report_date <= ${targetDateValue}::date
          ${polda ? sql`AND polda_name = ${polda}` : sql``}
        ) as pam_lainnya
    `);
    
    const stats = results.rows[0] as any;
    res.json({ ...stats, date: targetDateValue });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/kamtibmas/recent-cases:
 *   get:
 *     summary: Get recent crime records for the matrix table
 */
app.get('/api/kamtibmas/recent-cases', authenticateToken, async (req, res) => {
  const polda = req.query.polda;
  const classification = req.query.classification;
  const limit = parseInt(req.query.limit as string) || 20;
  const page = parseInt(req.query.page as string) || 1;
  const offset = (page - 1) * limit;
  
  try {
    const date = req.query.date;
    let targetDate;
    if (date) {
      targetDate = date;
    } else {
      const latestDateRes = await dbSecondary.execute(sql`SELECT MAX(report_date) as max_date FROM nasional_kamtibmas_case_data`);
      targetDate = latestDateRes.rows[0].max_date;
    }

    const whereConditions = [sql`sub_category NOT LIKE '%total%'`];
    if (polda) whereConditions.push(sql`polda_name = ${polda}`);
    if (classification) whereConditions.push(sql`sub_category = ${classification}`);
    if (targetDate) whereConditions.push(sql`report_date = ${targetDate}`);
    
    // Construct WHERE clause
    const whereClause = sql.join(whereConditions, sql` AND `);

    // Get Data
    const results = await dbSecondary.execute(sql`
      SELECT id, report_date as date, polda_name as location, sub_category as type, value as count
      FROM nasional_kamtibmas_case_data
      WHERE ${whereClause}
      ORDER BY value DESC, report_date DESC
      LIMIT ${limit} OFFSET ${offset}
    `);

    // Get Total Count for Pagination
    const countResult = await dbSecondary.execute(sql`
      SELECT COUNT(*) as total
      FROM nasional_kamtibmas_case_data
      WHERE ${whereClause}
    `);
    
    res.json({
      data: results.rows,
      pagination: {
        total: parseInt(countResult.rows[0].total as string),
        page,
        limit,
        totalPages: Math.ceil(parseInt(countResult.rows[0].total as string) / limit)
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/kamtibmas/trend:
 *   get:
 *     summary: Get 7-day historical trend for Kamtibmas classifications
 */
app.get('/api/kamtibmas/trend', authenticateToken, async (req, res) => {
  const polda = req.query.polda;
  try {
    const latestDateRes = await dbSecondary.execute(sql`SELECT MAX(report_date) as d FROM nasional_kamtibmas_case_data`);
    const targetDate = latestDateRes.rows[0].d;

    if (!targetDate) {
      return res.json([]);
    }

    const whereConditions = [sql`sub_category IN ('kejahatan_total', 'gangguan_total', 'pelanggaran_total', 'bencana_total')`];
    if (polda && polda !== 'Nasional') whereConditions.push(sql`polda_name = ${polda}`);
    
    // Last 7 days including the latest date
    whereConditions.push(sql`report_date >= (${targetDate}::date - INTERVAL '6 days')`);
    whereConditions.push(sql`report_date <= ${targetDate}::date`);
    
    const whereClause = sql.join(whereConditions, sql` AND `);

    const results = await dbSecondary.execute(sql`
      SELECT 
        report_date as date, 
        sub_category as type, 
        SUM(value) as total
      FROM nasional_kamtibmas_case_data
      WHERE ${whereClause}
      GROUP BY report_date, sub_category
      ORDER BY report_date ASC, sub_category ASC
    `);
    
    res.json(results.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/commodities/het-counts:
 *   get:
 *     summary: Get counts of commodities above HET for SP2KP and PIHPS
 */
app.get('/api/commodities/het-counts', authenticateToken, async (req, res) => {
  try {
    const results = await dbSecondary.execute(sql`
      WITH thresholds(code, het_price) AS (
        VALUES 
          ('beras-medium', 10900),
          ('beras-premium', 13900),
          ('bawang-merah', 32000),
          ('bawang-putih-honan', 30000),
          ('cabai-merah-besar', 45000),
          ('cabai-rawit-merah', 55000),
          ('daging-ayam-ras', 35000),
          ('daging-sapi-paha-belakang', 140000),
          ('gula-pasir-curah', 14500),
          ('minyak-goreng-curah', 14000)
      ),
      sp2kp_national_avg AS (
        SELECT commodity_code, AVG(price::numeric) as avg_price 
        FROM nasional_commodity_sp2kp 
        WHERE report_date = (SELECT MAX(report_date) FROM nasional_commodity_sp2kp)
        GROUP BY commodity_code
      ),
      pihps_national_avg AS (
        SELECT commodity_code, AVG(price::numeric) as avg_price 
        FROM nasional_pihps_commodity_regional_prices 
        WHERE report_date = (SELECT MAX(report_date) FROM nasional_pihps_commodity_regional_prices)
        AND market_type = 'pasar tradisional'
        GROUP BY commodity_code
      )
      SELECT 
        (SELECT COUNT(*)::int FROM sp2kp_national_avg s JOIN thresholds t ON s.commodity_code = t.code WHERE s.avg_price > t.het_price) as sp2kp,
        (SELECT COUNT(*)::int FROM pihps_national_avg p JOIN thresholds t ON p.commodity_code = t.code WHERE p.avg_price > t.het_price) as pihps
    `);
    
    res.json(results.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3001/api';

// Helper for resolving data source table and metadata columns
function resolveSource(source?: string) {
  const isPihps = source?.toLowerCase() === 'pihps';
  return {
    tableName: isPihps ? 'nasional_pihps_commodity_regional_prices' : 'nasional_commodity_sp2kp',
    metadataCol: isPihps ? 'additional_data' : 'additional_info',
    isPihps,
    // Add default filter for PIHPS to use traditional market for parity
    pihpsFilter: isPihps ? sql`AND market_type = 'pasar tradisional'` : sql``
  };
}

/**
 * @openapi
 * /api/commodities/regions:
 *   get:
 *     summary: Get unique regions from commodity data
 */
app.get('/api/commodities/regions', authenticateToken, async (req, res) => {
  const { tableName, pihpsFilter } = resolveSource(req.query.source as string);
  try {
    const results = await dbSecondary.execute(sql`
      SELECT DISTINCT region_name 
      FROM ${sql.identifier(tableName)}
      WHERE 1=1 ${pihpsFilter}
      ORDER BY region_name ASC
    `);
    const regions = results.rows.map(r => r.region_name);
    // Ensure "Nasional" is prioritized
    const finalRegions = regions.filter(r => r !== 'Nasional');
    res.json(['Nasional', ...finalRegions]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/commodities/dates:
 *   get:
 *     summary: Get unique available dates
 */
app.get('/api/commodities/dates', async (req, res) => {
  const { tableName, pihpsFilter } = resolveSource(req.query.source as string);
  try {
    const results = await dbSecondary.execute(sql`
      SELECT DISTINCT report_date 
      FROM ${sql.identifier(tableName)}
      WHERE 1=1 ${pihpsFilter}
      ORDER BY report_date DESC 
      LIMIT 60
    `);
    res.json(results.rows.map(r => r.report_date));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/commodities/matrix:
 *   get:
 *     summary: Get prices and 7-day variation for all commodities on a specific date
 */
app.get('/api/commodities/matrix', async (req, res) => {
  const region = req.query.region || 'Nasional';
  const dateStr = req.query.date as string;
  const { tableName, metadataCol, pihpsFilter } = resolveSource(req.query.source as string);
  
  try {
    const isNasional = region === 'Nasional';
    const dateQuery = dateStr ? sql`${dateStr}::date` : sql`(SELECT MAX(report_date) FROM ${sql.identifier(tableName)})`;
    
    const query = isNasional 
      ? sql`
          WITH latest_date AS (SELECT ${dateQuery} as d),
               national_latest AS (
                 SELECT commodity_code, AVG(price::numeric) as avg_price, MAX(report_date) as report_date
                 FROM ${sql.identifier(tableName)}, latest_date
                 WHERE report_date = latest_date.d ${pihpsFilter}
                 GROUP BY commodity_code
               ),
               national_prev AS (
                 SELECT commodity_code, AVG(price::numeric) as prev_price
                 FROM ${sql.identifier(tableName)}, latest_date
                 WHERE report_date = latest_date.d - INTERVAL '7 days' ${pihpsFilter}
                 GROUP BY commodity_code
               ),
               national_yesterday AS (
                 SELECT commodity_code, AVG(price::numeric) as yesterday_price
                 FROM ${sql.identifier(tableName)}, latest_date
                 WHERE report_date = latest_date.d - INTERVAL '1 day' ${pihpsFilter}
                 GROUP BY commodity_code
               )
          SELECT 
            nl.commodity_code, 
            (SELECT ${sql.identifier(metadataCol)}->>'variant_nama' FROM ${sql.identifier(tableName)} p2 WHERE p2.commodity_code = nl.commodity_code LIMIT 1) as name,
            ROUND(nl.avg_price, 0) as price,
            ROUND(COALESCE(np.prev_price, nl.avg_price), 0) as prev_price,
            ROUND(nl.avg_price - COALESCE(ny.yesterday_price, nl.avg_price), 0) as delta_day,
            ROUND(((nl.avg_price - COALESCE(np.prev_price, nl.avg_price)) / NULLIF(nl.avg_price, 0)) * 100, 2) as variation_pct,
            nl.report_date
          FROM national_latest nl
          LEFT JOIN national_prev np ON nl.commodity_code = np.commodity_code
          LEFT JOIN national_yesterday ny ON nl.commodity_code = ny.commodity_code
        `
      : sql`
          WITH latest_date AS (SELECT ${dateQuery} as d),
               regional_latest AS (
                 SELECT commodity_code, price::numeric as cur_price, ${sql.identifier(metadataCol)}->>'variant_nama' as name, report_date
                 FROM ${sql.identifier(tableName)}, latest_date
                 WHERE region_name = ${region} AND report_date = latest_date.d ${pihpsFilter}
               ),
               regional_prev AS (
                 SELECT commodity_code, price::numeric as prev_price
                 FROM ${sql.identifier(tableName)}, latest_date
                 WHERE region_name = ${region} AND report_date = latest_date.d - INTERVAL '7 days' ${pihpsFilter}
               ),
               regional_yesterday AS (
                 SELECT commodity_code, price::numeric as yesterday_price
                 FROM ${sql.identifier(tableName)}, latest_date
                 WHERE region_name = ${region} AND report_date = latest_date.d - INTERVAL '1 day' ${pihpsFilter}
               )
          SELECT 
            rl.commodity_code, 
            rl.name,
            rl.report_date,
            ROUND(rl.cur_price, 0) as price,
            ROUND(COALESCE(rp.prev_price, rl.cur_price), 0) as prev_price,
            ROUND(rl.cur_price - COALESCE(ry.yesterday_price, rl.cur_price), 0) as delta_day,
            ROUND(((rl.cur_price - COALESCE(rp.prev_price, rl.cur_price)) / NULLIF(rl.cur_price, 0)) * 100, 2) as variation_pct
          FROM regional_latest rl
          LEFT JOIN regional_prev rp ON rl.commodity_code = rp.commodity_code
          LEFT JOIN regional_yesterday ry ON rl.commodity_code = ry.commodity_code
        `;
    
    const results = await dbSecondary.execute(query);
    res.json(results.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/commodities/stats:
 *   get:
 *     summary: Get operational stats filtered by date and region
 */
app.get('/api/commodities/stats', authenticateToken, async (req, res) => {
  const region = req.query.region || 'Nasional';
  const dateStr = req.query.date as string;
  const { tableName, pihpsFilter } = resolveSource(req.query.source as string);
  
  try {
    const isNasional = region === 'Nasional';
    const dateQuery = dateStr ? sql`${dateStr}::date` : sql`(SELECT MAX(report_date) FROM ${sql.identifier(tableName)})`;
    const whereClause = isNasional ? sql`1=1` : sql`region_name = ${region}`;
    
    const results = await dbSecondary.execute(sql`
      WITH target_date AS (SELECT ${dateQuery} as d),
      current_month_avg AS (
        SELECT AVG(price::numeric) as avg_price
        FROM ${sql.identifier(tableName)}, target_date
        WHERE ${whereClause}
        AND report_month = EXTRACT(MONTH FROM target_date.d)
        AND report_year = EXTRACT(YEAR FROM target_date.d)
        AND report_date <= target_date.d ${pihpsFilter}
      ),
      prev_month_avg AS (
        SELECT AVG(price::numeric) as avg_price
        FROM ${sql.identifier(tableName)}, target_date
        WHERE ${whereClause}
        AND report_month = EXTRACT(MONTH FROM target_date.d - INTERVAL '1 month')
        AND report_year = EXTRACT(YEAR FROM target_date.d - INTERVAL '1 month') ${pihpsFilter}
      ),
      spikes AS (
        SELECT COUNT(*) as count
        FROM (
          SELECT commodity_code, 
                 AVG(price::numeric) as cur_price,
                 (SELECT AVG(price::numeric) FROM ${sql.identifier(tableName)} p2, target_date
                  WHERE p2.commodity_code = p1.commodity_code 
                  AND p2.report_date = target_date.d - INTERVAL '7 days'
                  AND ${isNasional ? sql`1=1` : sql`p2.region_name = ${region}`} ${pihpsFilter}) as prev_price
          FROM ${sql.identifier(tableName)} p1, target_date
          WHERE ${whereClause} AND report_date = target_date.d ${pihpsFilter}
          GROUP BY commodity_code
        ) t
        WHERE cur_price > (COALESCE(prev_price, 0) * 1.05)
      )
      SELECT 
        (SELECT count FROM spikes) as price_spikes,
        ROUND(((cm.avg_price - COALESCE(pm.avg_price, cm.avg_price)) / NULLIF(pm.avg_price, 0)) * 100, 2) as mom_inflation,
        (SELECT COUNT(DISTINCT region_name) FROM ${sql.identifier(tableName)}, target_date WHERE report_date = target_date.d ${pihpsFilter}) as active_nodes
      FROM current_month_avg cm, prev_month_avg pm
    `);
    
    res.json(results.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/analytics/kamtibmas-index:
 *   get:
 *     summary: Get Kamtibmas Risk Index for a specific region
 *     description: Returns the latest risk index and sub-category metrics from the secondary database.
 *     parameters:
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         description: Province name or 'Nasional'
 *     responses:
 *       200:
 *         description: Kamtibmas Index data object.
 */
app.get('/api/analytics/kamtibmas-index', authenticateToken, async (req, res) => {
  const region = req.query.region || 'Nasional';
  try {
    const isNasional = region === 'Nasional';
    
    if (isNasional) {
      // Aggregate all regional data for today to build the Nasional profile
      const results = await dbSecondary.execute(sql`
        SELECT 
          AVG(value) as index_value,
          SUM(((additional_data->'case_detail'->'kejahatan_total')::jsonb->0->>'kasus_mingguan')::numeric) as kejahatan,
          SUM(((additional_data->'case_detail'->'gangguan_total')::jsonb->0->>'kasus_mingguan')::numeric) as gangguan,
          SUM(((additional_data->'case_detail'->'pelanggaran_total')::jsonb->0->>'kasus_mingguan')::numeric) as pelanggaran,
          SUM(((additional_data->'case_detail'->'bencana_total')::jsonb->0->>'kasus_mingguan')::numeric) as bencana,
          AVG((additional_data->>'irs')::numeric) as irs,
          MAX(report_date) as report_date
        FROM calculation_index_risiko
        WHERE category ILIKE '%KAMTIBMAS%'
        AND report_date = CURRENT_DATE
      `);

      if (results.rows.length === 0 || results.rows[0].index_value === null) {
        return res.status(404).json({ message: 'No regional data available for national aggregation today.' });
      }

      const row = results.rows[0] as any;
      const aggregatedData = {
        index_value: Number(row.index_value),
        report_date: row.report_date,
        region_name: 'Nasional',
        additional_data: {
          irs: Number(row.irs),
          level: Number(row.irs) > 25 ? 'tinggi' : 'normal',
          raw_total_week_prov: Number(row.kejahatan) + Number(row.gangguan) + Number(row.pelanggaran) + Number(row.bencana),
          case_detail: {
            kejahatan_total: [{ kasus_mingguan: Number(row.kejahatan) }],
            gangguan_total: [{ kasus_mingguan: Number(row.gangguan) }],
            pelanggaran_total: [{ kasus_mingguan: Number(row.pelanggaran) }],
            bencana_total: [{ kasus_mingguan: Number(row.bencana) }]
          }
        }
      };
      return res.json(aggregatedData);
    } else {
      // Standard regional query
      const results = await dbSecondary.execute(sql`
        SELECT 
          value as index_value,
          additional_data,
          report_date,
          region_name
        FROM calculation_index_risiko
        WHERE category ILIKE '%KAMTIBMAS%'
        AND region_name = ${region}
        ORDER BY report_date DESC
        LIMIT 1
      `);
      
      if (results.rows.length === 0) {
        return res.status(404).json({ message: 'No data available for the specified region' });
      }
      
      res.json(results.rows[0]);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/commodities/trend:
 *   get:
 *     summary: Get 30-day historical trend based on reference date
 */
app.get('/api/commodities/trend', authenticateToken, async (req, res) => {
  const region = req.query.region || 'Nasional';
  const commodity = req.query.commodity || 'beras-medium';
  const dateStr = req.query.date as string;
  const range = (req.query.range as string) || '30d';
  const { tableName, metadataCol, pihpsFilter } = resolveSource(req.query.source as string);

  try {
    const isNasional = region === 'Nasional';
    const dateQuery = dateStr ? sql`${dateStr}::date` : sql`(SELECT MAX(report_date) FROM ${sql.identifier(tableName)})`;
    
    let intervalClause = sql`AND report_date > target_date.d - INTERVAL '30 days'`;
    if (range === '7d') intervalClause = sql`AND report_date > target_date.d - INTERVAL '7 days'`;
    else if (range === '3m') intervalClause = sql`AND report_date > target_date.d - INTERVAL '3 months'`;
    else if (range === '1y') intervalClause = sql`AND report_date > target_date.d - INTERVAL '1 year'`;
    else if (range === 'all') intervalClause = sql``;

    const query = isNasional
      ? sql`
          WITH target_date AS (SELECT ${dateQuery} as d)
          SELECT report_date, ROUND(AVG(price::numeric), 0) as price,
                 (SELECT ${sql.identifier(metadataCol)} FROM ${sql.identifier(tableName)} p2 
                  WHERE p2.commodity_code = ${commodity} 
                  AND p2.region_name = 'Nasional'
                  AND p2.report_date = p1.report_date LIMIT 1) as additional_info
          FROM ${sql.identifier(tableName)} p1, target_date
          WHERE commodity_code = ${commodity}
          AND report_date <= target_date.d ${pihpsFilter}
          ${intervalClause}
          GROUP BY report_date
          ORDER BY report_date ASC
        `
      : sql`
          WITH target_date AS (SELECT ${dateQuery} as d)
          SELECT report_date, ROUND(price::numeric, 0) as price, ${sql.identifier(metadataCol)} as additional_info
          FROM ${sql.identifier(tableName)}, target_date
          WHERE commodity_code = ${commodity}
          AND region_name = ${region}
          AND report_date <= target_date.d ${pihpsFilter}
          ${intervalClause}
          ORDER BY report_date ASC
        `;
    
    const results = await dbSecondary.execute(query);
    res.json(results.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/commodities/crosstab:
 *   get:
 *     summary: Get cross-regional price snapshot for a specific commodity and date
 */
app.get('/api/commodities/crosstab', async (req, res) => {
  const commodity = req.query.commodity || 'beras-medium';
  const dateStr = req.query.date as string;
  const { tableName, metadataCol, pihpsFilter } = resolveSource(req.query.source as string);

  try {
    const dateQuery = dateStr ? sql`${dateStr}::date` : sql`(SELECT MAX(report_date) FROM ${sql.identifier(tableName)})`;
    
    const query = sql`
      WITH target_date AS (SELECT ${dateQuery} as d)
      SELECT 
        region_name, 
        ROUND(price::numeric, 0) as price,
        (${sql.identifier(metadataCol)}->>'delta_harga')::numeric as delta_harga,
        (${sql.identifier(metadataCol)}->>'persen_perubahan')::numeric as variation_pct
      FROM ${sql.identifier(tableName)}, target_date
      WHERE commodity_code = ${commodity}
      AND report_date = target_date.d ${pihpsFilter}
      AND region_name != 'Nasional'
      ORDER BY region_name ASC
    `;
    
    const results = await dbSecondary.execute(query);
    res.json(results.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/auth/upload-profile:
 *   post:
 *     summary: Upload profile photo
 *     description: Uploads a JPG/PNG image and updates the user's profile picture URL.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads/profiles'));
  },
  filename: (req, file, cb) => {
    const userId = (req as any).user?.id || 'unknown';
    const ext = path.extname(file.originalname);
    cb(null, `profile-${userId}-${Date.now()}${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Hanya diperbolehkan format gambar (JPG/PNG/WebP)!'));
  }
});

app.post('/api/auth/upload-profile', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Tidak ada file yang diunggah' });
    }

    const userId = (req as any).user.id;
    const photoUrl = `/uploads/profiles/${req.file.filename}`;

    // Update users table
    await dbPrimary.execute(sql`
      UPDATE users 
      SET picture = ${photoUrl}, updated_at = NOW() 
      WHERE id = ${userId}
    `);

    res.json({ 
      message: 'Foto profil berhasil diperbarui',
      photoUrl 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/auth/update-profile:
 *   put:
 *     summary: Update profile details
 *     description: Updates the user's full name and phone number.
 */
app.put('/api/auth/update-profile', authenticateToken, async (req, res) => {
  const { name, phone } = req.body;
  const userId = (req as any).user.id;

  if (!name) {
    return res.status(400).json({ error: 'Nama Lengkap tidak boleh kosong' });
  }

  try {
    await dbPrimary.execute(sql`
      UPDATE users 
      SET name = ${name}, phone = ${phone}, updated_at = NOW() 
      WHERE id = ${userId}
    `);

    res.json({ message: 'Profil berhasil diperbarui' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/auth/login-logs:
 *   get:
 *     summary: Get recent login activity
 *     description: Returns the last 10 login sessions for the authenticated user.
 */
app.get('/api/auth/login-logs', authenticateToken, async (req, res) => {
  const userId = (req as any).user.id;

  try {
    const logs = await dbPrimary.execute(sql`
      SELECT id, ip_address, user_agent, location, created_at
      FROM user_login_logs
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 10
    `);

    res.json(logs.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Authenticate personnel
 *     description: Verify identity using NRP or Email and numerical PIN (password). Includes Rate Limiting.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identity:
 *                 type: string
 *                 description: NRP or Email address
 *               password:
 *                 type: string
 *                 description: Access PIN
 *     responses:
 *       200:
 *         description: Authentication successful
 *       401:
 *         description: Invalid credentials
 *       429:
 *         description: Too many requests
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 attempts
  message: { error: 'Terlalu banyak percobaan login, silakan coba lagi dalam 15 menit' },
});

app.post('/api/auth/login', loginLimiter, async (req, res) => {
  const { identity, password } = req.body;

  if (!identity || !password) {
    return res.status(400).json({ error: 'NRP/Email dan Password wajib diisi' });
  }

  try {
    const query = sql`
      SELECT id, nrp, name, email, password, role, is_active, phone, picture 
      FROM users 
      WHERE (nrp = ${identity} OR email = ${identity}) 
      AND is_active = true
      LIMIT 1
    `;
    
    const result = await dbPrimary.execute(query);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Identitas atau Password salah' });
    }

    const user = result.rows[0] as any;

    // Verify Password with Bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Identitas atau Password salah' });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user.id, nrp: user.nrp, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Record Login Log
    try {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const ua = req.headers['user-agent'];
      await dbPrimary.execute(sql`
        INSERT INTO user_login_logs (user_id, ip_address, user_agent, location)
        VALUES (${user.id}, ${ip as string}, ${ua}, 'Jakarta, Indonesia')
      `);
    } catch (logErr) {
      console.error('Failed to record login log:', logErr);
      // Don't fail the login if logging fails
    }

    res.json({
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        nrp: user.nrp,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        picture: user.picture
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const host = process.env.HOST || '0.0.0.0';

app.listen(Number(port), host, () => {
  console.log(`🚀 Sakti Backend running at http://${host}:${port}`);
  console.log(`📡 OpenAPI Spec available at http://${host}:${port}/openapi.json`);
});
