import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import { dbPrimary, dbSecondary } from './db';
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
 * /api/analytics/kamtibmas-national-stats:
 *   get:
 *     summary: Get national Kamtibmas totals for today and yesterday
 *     responses:
 *       200:
 *         description: Object containing today and yesterday totals + trend.
 */
app.get('/api/analytics/kamtibmas-national-stats', authenticateToken, async (req, res) => {
  try {
    const results = await dbSecondary.execute(sql`
      WITH daily_stats AS (
        SELECT 
          report_date,
          SUM(
            COALESCE(((additional_data->'case_detail'->'kejahatan_total')::jsonb->0->>'kasus_mingguan')::numeric, 0) +
            COALESCE(((additional_data->'case_detail'->'gangguan_total')::jsonb->0->>'kasus_mingguan')::numeric, 0) +
            COALESCE(((additional_data->'case_detail'->'pelanggaran_total')::jsonb->0->>'kasus_mingguan')::numeric, 0) +
            COALESCE(((additional_data->'case_detail'->'bencana_total')::jsonb->0->>'kasus_mingguan')::numeric, 0)
          ) as daily_total
        FROM calculation_index_risiko
        WHERE category ILIKE '%KAMTIBMAS%'
        AND report_date IN (CURRENT_DATE, CURRENT_DATE - INTERVAL '1 day')
        GROUP BY report_date
      )
      SELECT 
        (SELECT daily_total FROM daily_stats WHERE report_date = CURRENT_DATE) as today,
        (SELECT daily_total FROM daily_stats WHERE report_date = CURRENT_DATE - INTERVAL '1 day') as yesterday
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
      trend_pct: parseFloat(trend_pct.toFixed(2))
    });
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
