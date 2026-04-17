/**
 * Migration Script: GADM GeoJSON → region_indonesia_cities
 * 
 * Reads gadm41_IDN_2.json and inserts each feature (city/regency)
 * into the `region_indonesia_cities` table in DB_SECONDARY_URL.
 * 
 * Usage:
 *   npx tsx server/scripts/migrate-geojson-to-db.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_URL = 'postgres://soma:kiyaisoma%21%40%23123@206.237.97.43:5432/db_indonesiamonitoring';
const GEOJSON_PATH = path.resolve(__dirname, '../../src/assets/gadm41_IDN_2.json');

async function main() {
  console.log('🚀 Starting GeoJSON → region_indonesia_cities migration...');
  console.log(`📂 Reading GeoJSON from: ${GEOJSON_PATH}`);

  // 1. Read and parse GeoJSON
  const raw = fs.readFileSync(GEOJSON_PATH, 'utf-8');
  const geojson = JSON.parse(raw);
  const features = geojson.features;
  console.log(`✅ Loaded ${features.length} features from GeoJSON`);

  // 2. Connect to database
  const pool = new pg.Pool({ connectionString: DB_URL });
  const client = await pool.connect();
  console.log('✅ Connected to database');

  try {
    // 3. Create table (drop if exists for clean migration)
    await client.query(`
      DROP TABLE IF EXISTS region_indonesia_cities;
    `);
    console.log('🗑️  Dropped existing table (if any)');

    await client.query(`
      CREATE TABLE region_indonesia_cities (
        id SERIAL PRIMARY KEY,
        gid_2 VARCHAR(50) NOT NULL,
        gid_0 VARCHAR(10) NOT NULL DEFAULT 'IDN',
        country VARCHAR(50) NOT NULL DEFAULT 'Indonesia',
        gid_1 VARCHAR(50),
        province_name VARCHAR(100) NOT NULL,
        nl_name_1 VARCHAR(100),
        city_name VARCHAR(150) NOT NULL,
        varname_2 VARCHAR(200),
        nl_name_2 VARCHAR(200),
        city_type VARCHAR(50),
        city_type_en VARCHAR(50),
        cc_2 VARCHAR(20),
        hasc_2 VARCHAR(20),
        geometry JSONB NOT NULL,
        centroid_lat DOUBLE PRECISION,
        centroid_lon DOUBLE PRECISION,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Created table region_indonesia_cities');

    // 4. Insert features in batches
    const BATCH_SIZE = 50;
    let inserted = 0;

    for (let i = 0; i < features.length; i += BATCH_SIZE) {
      const batch = features.slice(i, i + BATCH_SIZE);
      
      await client.query('BEGIN');
      
      for (const feature of batch) {
        const props = feature.properties;
        const geometry = feature.geometry;
        
        // Calculate a rough centroid from the geometry
        const centroid = calculateCentroid(geometry);

        await client.query(
          `INSERT INTO region_indonesia_cities 
            (gid_2, gid_0, country, gid_1, province_name, nl_name_1, city_name, varname_2, nl_name_2, city_type, city_type_en, cc_2, hasc_2, geometry, centroid_lat, centroid_lon)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
          [
            props.GID_2,
            props.GID_0,
            props.COUNTRY,
            props.GID_1,
            props.NAME_1,
            props.NL_NAME_1 === 'NA' ? null : props.NL_NAME_1,
            props.NAME_2,
            props.VARNAME_2 === 'NA' ? null : props.VARNAME_2,
            props.NL_NAME_2 === 'NA' ? null : props.NL_NAME_2,
            props.TYPE_2,
            props.ENGTYPE_2,
            props.CC_2,
            props.HASC_2,
            JSON.stringify(geometry),
            centroid.lat,
            centroid.lon,
          ]
        );
        inserted++;
      }
      
      await client.query('COMMIT');
      console.log(`  📦 Inserted ${inserted}/${features.length} features...`);
    }

    // 5. Create indexes for fast lookup
    await client.query(`
      CREATE INDEX idx_region_cities_province ON region_indonesia_cities (province_name);
      CREATE INDEX idx_region_cities_city ON region_indonesia_cities (city_name);
      CREATE INDEX idx_region_cities_gid2 ON region_indonesia_cities (gid_2);
      CREATE INDEX idx_region_cities_cc2 ON region_indonesia_cities (cc_2);
      CREATE INDEX idx_region_cities_type ON region_indonesia_cities (city_type);
    `);
    console.log('✅ Created indexes');

    // 6. Print summary
    const countResult = await client.query('SELECT COUNT(*) as total FROM region_indonesia_cities');
    const provinceResult = await client.query('SELECT COUNT(DISTINCT province_name) as total FROM region_indonesia_cities');
    const typeResult = await client.query(`
      SELECT city_type, COUNT(*) as count 
      FROM region_indonesia_cities 
      GROUP BY city_type 
      ORDER BY count DESC
    `);

    console.log('\n════════════════════════════════════════');
    console.log('📊 MIGRATION SUMMARY');
    console.log('════════════════════════════════════════');
    console.log(`  Total cities/regencies : ${countResult.rows[0].total}`);
    console.log(`  Total provinces        : ${provinceResult.rows[0].total}`);
    console.log('  By type:');
    for (const row of typeResult.rows) {
      console.log(`    ${row.city_type}: ${row.count}`);
    }
    console.log('════════════════════════════════════════');
    console.log('✅ Migration complete!');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
    console.log('🔌 Database connection closed');
  }
}

/**
 * Calculate a rough centroid from a GeoJSON geometry
 * by averaging all coordinate points.
 */
function calculateCentroid(geometry: any): { lat: number; lon: number } {
  const coords: number[][] = [];

  function extractCoords(arr: any) {
    if (typeof arr[0] === 'number') {
      coords.push(arr);
    } else {
      for (const item of arr) {
        extractCoords(item);
      }
    }
  }

  extractCoords(geometry.coordinates);

  if (coords.length === 0) return { lat: 0, lon: 0 };

  const sumLon = coords.reduce((acc, c) => acc + c[0], 0);
  const sumLat = coords.reduce((acc, c) => acc + c[1], 0);

  return {
    lon: sumLon / coords.length,
    lat: sumLat / coords.length,
  };
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
