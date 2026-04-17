const { Client } = require('pg');
const DB_URL = 'postgresql://pendekar_sakti:s4kt1m4ndr4gun%40666@206.237.97.43:5432/db_sakti';

async function main() {
  const client = new Client({ connectionString: DB_URL });
  try {
    await client.connect();
    
    // Check if nrp already exists to avoid duplicates
    const checkRes = await client.query('SELECT nrp FROM users WHERE nrp IN ($1, $2)', ['admindemo', 'anggotademo']);
    const existingNrps = checkRes.rows.map(r => r.nrp);

    if (!existingNrps.includes('admindemo')) {
      console.log('Inserting admin user...');
      await client.query(`
        INSERT INTO users (nrp, name, password, role, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      `, ['admindemo', 'Admin Demo', 'admindemo', 'admin', true]);
    } else {
      console.log('Admin user already exists.');
    }

    if (!existingNrps.includes('anggotademo')) {
      console.log('Inserting anggota user...');
      await client.query(`
        INSERT INTO users (nrp, name, password, role, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      `, ['anggotademo', 'Anggota Demo', 'anggotademo', 'anggota', true]);
    } else {
      console.log('Anggota user already exists.');
    }

    console.log('Done.');
  } catch (err) {
    console.error('Error during insertion:', err);
  } finally {
    await client.end();
  }
}
main();
