import express from 'express';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import { dbPrimary, dbSecondary } from './db.ts';
import { sql } from 'drizzle-orm';

const app = express();
const port = process.env.PORT || 3001;

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
        url: `http://localhost:${port}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/index.ts'], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);


// Middleware
app.use(cors());
app.use(express.json());

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
app.get('/api/metadata/secondary', async (req, res) => {
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
app.get('/api/weather/cities', async (req, res) => {
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
 *         description: The name of the city (default: JAKARTA PUSAT)
 *     responses:
 *       200:
 *         description: Detailed 7-day forecast and current stats.
 */
app.get('/api/weather/forecast', async (req, res) => {
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

app.listen(port, () => {
  console.log(`🚀 Sakti Backend running at http://localhost:${port}`);
  console.log(`📡 OpenAPI Spec available at http://localhost:${port}/openapi.json`);
});
