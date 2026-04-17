import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_URL = 'postgres://soma:kiyaisoma%21%40%23123@206.237.97.43:5432/db_indonesiamonitoring';
const GEOJSON_PATH = path.resolve(__dirname, '../../src/assets/gadm41_IDN_2.json');

async function main() {
  const client = new pg.Client({ connectionString: DB_URL });
  await client.connect();
  console.log('Connected to database.');

  // Drop and recreate table
  await client.query(`DROP TABLE IF EXISTS region_indonesia_cities`);
  console.log('Dropped existing table (if any).');

  await client.query(`
    CREATE TABLE region_indonesia_cities (
      id SERIAL PRIMARY KEY,
      gid_2 VARCHAR(20) NOT NULL,
      gid_0 VARCHAR(5) NOT NULL DEFAULT 'IDN',
      country VARCHAR(50) NOT NULL DEFAULT 'Indonesia',
      gid_1 VARCHAR(20) NOT NULL,
      province VARCHAR(100) NOT NULL,
      nl_name_1 VARCHAR(100),
      city VARCHAR(100) NOT NULL,
      varname_2 VARCHAR(200),
      nl_name_2 VARCHAR(200),
      type VARCHAR(30) NOT NULL,
      engtype VARCHAR(30) NOT NULL,
      cc_code VARCHAR(10),
      hasc_code VARCHAR(20),
      centroid_lat DOUBLE PRECISION,
      centroid_lng DOUBLE PRECISION,
      geometry JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('Created table region_indonesia_cities.');

  // Read GeoJSON
  const raw = fs.readFileSync(GEOJSON_PATH, 'utf-8');
  const geojson = JSON.parse(raw);
  console.log(`Loaded ${geojson.features.length} features from GeoJSON.`);

  let inserted = 0;
  for (const feature of geojson.features) {
    const p = feature.properties;
    const geom = feature.geometry;

    // Calculate centroid from coordinates (rough average of all points)
    let sumLat = 0, sumLng = 0, count = 0;
    const coords = geom.coordinates;
    for (const polygon of coords) {
      for (const ring of polygon) {
        for (const point of ring) {
          sumLng += point[0];
          sumLat += point[1];
          count++;
        }
      }
    }
    const centroidLat = count > 0 ? sumLat / count : null;
    const centroidLng = count > 0 ? sumLng / count : null;

    await client.query(
      `INSERT INTO region_indonesia_cities 
       (gid_2, gid_0, country, gid_1, province, nl_name_1, city, varname_2, nl_name_2, type, engtype, cc_code, hasc_code, centroid_lat, centroid_lng, geometry)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [
        p.GID_2,
        p.GID_0,
        p.COUNTRY,
        p.GID_1,
        p.NAME_1,
        p.NL_NAME_1 === 'NA' ? null : p.NL_NAME_1,
        p.NAME_2,
        p.VARNAME_2 === 'NA' ? null : p.VARNAME_2,
        p.NL_NAME_2 === 'NA' ? null : p.NL_NAME_2,
        p.TYPE_2,
        p.ENGTYPE_2,
        p.CC_2 === 'NA' ? null : p.CC_2,
        p.HASC_2 === 'NA' ? null : p.HASC_2,
        centroidLat,
        centroidLng,
        JSON.stringify(geom)
      ]
    );
    inserted++;
    if (inserted % 50 === 0) {
      console.log(`  Inserted ${inserted}/${geojson.features.length}...`);
    }
  }

  // Create indexes
  await client.query(`CREATE INDEX idx_region_cities_province ON region_indonesia_cities (province)`);
  await client.query(`CREATE INDEX idx_region_cities_city ON region_indonesia_cities (city)`);
  await client.query(`CREATE INDEX idx_region_cities_type ON region_indonesia_cities (type)`);
  await client.query(`CREATE INDEX idx_region_cities_cc_code ON region_indonesia_cities (cc_code)`);
  console.log('Created indexes.');

  // Verify
  const res = await client.query(`SELECT COUNT(*) as total FROM region_indonesia_cities`);
  console.log(`\n✅ Done! Total rows inserted: ${res.rows[0].total}`);

  const sample = await client.query(`SELECT province, city, type, cc_code, ROUND(centroid_lat::numeric, 4) as lat, ROUND(centroid_lng::numeric, 4) as lng FROM region_indonesia_cities LIMIT 5`);
  console.log('\nSample rows:');
  console.table(sample.rows);

  await client.end();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
