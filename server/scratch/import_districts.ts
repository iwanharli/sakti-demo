import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_URL = 'postgres://soma:kiyaisoma%21%40%23123@206.237.97.43:5432/db_indonesiamonitoring';
const GEOJSON_PATH = path.resolve(__dirname, '../../src/assets/gadm41_IDN_3.json');

async function main() {
  const client = new pg.Client({ connectionString: DB_URL });
  await client.connect();
  console.log('Connected to database.');

  await client.query(`DROP TABLE IF EXISTS region_indonesia_districts`);
  console.log('Dropped existing table (if any).');

  await client.query(`
    CREATE TABLE region_indonesia_districts (
      id SERIAL PRIMARY KEY,
      gid_3 VARCHAR(30) NOT NULL,
      gid_0 VARCHAR(5) NOT NULL DEFAULT 'IDN',
      country VARCHAR(50) NOT NULL DEFAULT 'Indonesia',
      gid_1 VARCHAR(20) NOT NULL,
      province VARCHAR(100) NOT NULL,
      nl_name_1 VARCHAR(100),
      gid_2 VARCHAR(20) NOT NULL,
      city VARCHAR(100) NOT NULL,
      nl_name_2 VARCHAR(200),
      district VARCHAR(100) NOT NULL,
      varname_3 VARCHAR(200),
      nl_name_3 VARCHAR(200),
      type VARCHAR(30) NOT NULL,
      engtype VARCHAR(30) NOT NULL,
      cc_code VARCHAR(15),
      hasc_code VARCHAR(20),
      centroid_lat DOUBLE PRECISION,
      centroid_lng DOUBLE PRECISION,
      geometry JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('Created table region_indonesia_districts.');

  // Read GeoJSON
  const raw = fs.readFileSync(GEOJSON_PATH, 'utf-8');
  const geojson = JSON.parse(raw);
  console.log(`Loaded ${geojson.features.length} features from GeoJSON.`);

  // Batch insert for performance (6695 rows)
  let inserted = 0;
  const BATCH_SIZE = 50;
  let values: any[] = [];
  let placeholders: string[] = [];
  let paramIdx = 1;

  const flush = async () => {
    if (placeholders.length === 0) return;
    await client.query(
      `INSERT INTO region_indonesia_districts 
       (gid_3, gid_0, country, gid_1, province, nl_name_1, gid_2, city, nl_name_2, district, varname_3, nl_name_3, type, engtype, cc_code, hasc_code, centroid_lat, centroid_lng, geometry)
       VALUES ${placeholders.join(', ')}`,
      values
    );
    values = [];
    placeholders = [];
    paramIdx = 1;
  };

  for (const feature of geojson.features) {
    const p = feature.properties;
    const geom = feature.geometry;

    // Calculate centroid
    let sumLat = 0, sumLng = 0, count = 0;
    for (const polygon of geom.coordinates) {
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

    const row = [
      p.GID_3, p.GID_0, p.COUNTRY, p.GID_1, p.NAME_1,
      p.NL_NAME_1 === 'NA' ? null : p.NL_NAME_1,
      p.GID_2, p.NAME_2,
      p.NL_NAME_2 === 'NA' ? null : p.NL_NAME_2,
      p.NAME_3,
      p.VARNAME_3 === 'NA' ? null : p.VARNAME_3,
      p.NL_NAME_3 === 'NA' ? null : p.NL_NAME_3,
      p.TYPE_3, p.ENGTYPE_3,
      p.CC_3 === 'NA' ? null : p.CC_3,
      p.HASC_3 === 'NA' ? null : p.HASC_3,
      centroidLat, centroidLng,
      JSON.stringify(geom)
    ];

    const cols = row.length;
    const ph = `(${Array.from({length: cols}, (_, i) => `$${paramIdx + i}`).join(', ')})`;
    placeholders.push(ph);
    values.push(...row);
    paramIdx += cols;
    inserted++;

    if (inserted % BATCH_SIZE === 0) {
      await flush();
      if (inserted % 500 === 0) {
        console.log(`  Inserted ${inserted}/${geojson.features.length}...`);
      }
    }
  }
  await flush();

  console.log(`  Inserted ${inserted}/${geojson.features.length} (final).`);

  // Create indexes
  await client.query(`CREATE INDEX idx_region_districts_province ON region_indonesia_districts (province)`);
  await client.query(`CREATE INDEX idx_region_districts_city ON region_indonesia_districts (city)`);
  await client.query(`CREATE INDEX idx_region_districts_district ON region_indonesia_districts (district)`);
  await client.query(`CREATE INDEX idx_region_districts_type ON region_indonesia_districts (type)`);
  await client.query(`CREATE INDEX idx_region_districts_cc_code ON region_indonesia_districts (cc_code)`);
  await client.query(`CREATE INDEX idx_region_districts_gid_2 ON region_indonesia_districts (gid_2)`);
  console.log('Created indexes.');

  // Verify
  const res = await client.query(`SELECT COUNT(*) as total FROM region_indonesia_districts`);
  console.log(`\n✅ Done! Total rows inserted: ${res.rows[0].total}`);

  const sample = await client.query(`SELECT province, city, district, type, cc_code, ROUND(centroid_lat::numeric, 4) as lat, ROUND(centroid_lng::numeric, 4) as lng FROM region_indonesia_districts LIMIT 5`);
  console.log('\nSample rows:');
  console.table(sample.rows);

  const stats = await client.query(`SELECT type, COUNT(*) as total FROM region_indonesia_districts GROUP BY type ORDER BY total DESC`);
  console.log('\nType distribution:');
  console.table(stats.rows);

  await client.end();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
