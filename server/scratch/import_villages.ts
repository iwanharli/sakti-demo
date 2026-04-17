import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_URL = 'postgres://soma:kiyaisoma%21%40%23123@206.237.97.43:5432/db_indonesiamonitoring';
const GEOJSON_PATH = path.resolve(__dirname, '../../src/assets/gadm41_IDN_4.json');

async function main() {
  const client = new pg.Client({ connectionString: DB_URL });
  await client.connect();
  console.log('Connected to database.');

  await client.query(`DROP TABLE IF EXISTS region_indonesia_villages`);
  console.log('Dropped existing table (if any).');

  await client.query(`
    CREATE TABLE region_indonesia_villages (
      id SERIAL PRIMARY KEY,
      gid_4 VARCHAR(30) NOT NULL,
      gid_0 VARCHAR(5) NOT NULL DEFAULT 'IDN',
      country VARCHAR(50) NOT NULL DEFAULT 'Indonesia',
      gid_1 VARCHAR(20) NOT NULL,
      province VARCHAR(100) NOT NULL,
      gid_2 VARCHAR(20) NOT NULL,
      city VARCHAR(100) NOT NULL,
      gid_3 VARCHAR(30) NOT NULL,
      district VARCHAR(100) NOT NULL,
      village VARCHAR(100) NOT NULL,
      varname_4 VARCHAR(200),
      type VARCHAR(30) NOT NULL,
      engtype VARCHAR(30) NOT NULL,
      cc_code VARCHAR(15),
      centroid_lat DOUBLE PRECISION,
      centroid_lng DOUBLE PRECISION,
      geometry JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('Created table region_indonesia_villages.');

  // Read GeoJSON
  console.log('Reading GeoJSON file (this may take a moment)...');
  const raw = fs.readFileSync(GEOJSON_PATH, 'utf-8');
  const geojson = JSON.parse(raw);
  const total = geojson.features.length;
  console.log(`Loaded ${total} features from GeoJSON.`);

  // Batch insert for performance
  let inserted = 0;
  const BATCH_SIZE = 100;
  const COLS = 17; // number of columns per row

  const flushBatch = async (rows: any[][]) => {
    if (rows.length === 0) return;
    const values: any[] = [];
    const placeholders: string[] = [];
    let idx = 1;
    for (const row of rows) {
      placeholders.push(`(${Array.from({length: COLS}, (_, i) => `$${idx + i}`).join(', ')})`);
      values.push(...row);
      idx += COLS;
    }
    await client.query(
      `INSERT INTO region_indonesia_villages 
       (gid_4, gid_0, country, gid_1, province, gid_2, city, gid_3, district, village, varname_4, type, engtype, cc_code, centroid_lat, centroid_lng, geometry)
       VALUES ${placeholders.join(', ')}`,
      values
    );
  };

  let batch: any[][] = [];
  const startTime = Date.now();

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

    batch.push([
      p.GID_4, p.GID_0, p.COUNTRY, p.GID_1, p.NAME_1,
      p.GID_2, p.NAME_2, p.GID_3, p.NAME_3,
      p.NAME_4,
      p.VARNAME_4 === 'NA' ? null : p.VARNAME_4,
      p.TYPE_4, p.ENGTYPE_4,
      p.CC_4 === 'NA' ? null : p.CC_4,
      count > 0 ? sumLat / count : null,
      count > 0 ? sumLng / count : null,
      JSON.stringify(geom)
    ]);

    inserted++;

    if (batch.length >= BATCH_SIZE) {
      await flushBatch(batch);
      batch = [];
      if (inserted % 5000 === 0) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const rate = (inserted / parseFloat(elapsed)).toFixed(0);
        console.log(`  Inserted ${inserted}/${total} (${elapsed}s, ~${rate} rows/s)...`);
      }
    }
  }
  await flushBatch(batch);

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`  Inserted ${inserted}/${total} (final, ${totalTime}s).`);

  // Create indexes
  console.log('Creating indexes...');
  await client.query(`CREATE INDEX idx_villages_province ON region_indonesia_villages (province)`);
  await client.query(`CREATE INDEX idx_villages_city ON region_indonesia_villages (city)`);
  await client.query(`CREATE INDEX idx_villages_district ON region_indonesia_villages (district)`);
  await client.query(`CREATE INDEX idx_villages_village ON region_indonesia_villages (village)`);
  await client.query(`CREATE INDEX idx_villages_type ON region_indonesia_villages (type)`);
  await client.query(`CREATE INDEX idx_villages_cc_code ON region_indonesia_villages (cc_code)`);
  await client.query(`CREATE INDEX idx_villages_gid_3 ON region_indonesia_villages (gid_3)`);
  await client.query(`CREATE INDEX idx_villages_gid_2 ON region_indonesia_villages (gid_2)`);
  console.log('Created 8 indexes.');

  // Verify
  const res = await client.query(`SELECT COUNT(*) as total FROM region_indonesia_villages`);
  console.log(`\n✅ Done! Total rows inserted: ${res.rows[0].total}`);

  const sample = await client.query(`SELECT province, city, district, village, type, cc_code FROM region_indonesia_villages LIMIT 5`);
  console.log('\nSample rows:');
  console.table(sample.rows);

  const stats = await client.query(`SELECT type, COUNT(*) as total FROM region_indonesia_villages GROUP BY type ORDER BY total DESC`);
  console.log('\nType distribution:');
  console.table(stats.rows);

  await client.end();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
