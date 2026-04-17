const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const DB_URL = 'postgresql://pendekar_sakti:s4kt1m4ndr4gun%40666@206.237.97.43:5432/db_sakti';

async function main() {
  const client = new Client({ connectionString: DB_URL });
  try {
    await client.connect();
    
    // Fetch all users to update their passwords to hashed versions
    const res = await client.query('SELECT id, nrp, password FROM users');
    console.log(`Found ${res.rows.length} users to migrate.`);

    for (const user of res.rows) {
      if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        console.log(`User ${user.nrp} already has a hashed password. Skipping.`);
        continue;
      }
      
      console.log(`Hashing password for user: ${user.nrp}...`);
      const hashed = await bcrypt.hash(user.password, 10);
      
      await client.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, user.id]);
      console.log(`User ${user.nrp} update success.`);
    }

    console.log('Migration Complete.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

main();
