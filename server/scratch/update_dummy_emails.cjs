const { Client } = require('pg');
const DB_URL = 'postgresql://pendekar_sakti:s4kt1m4ndr4gun%40666@206.237.97.43:5432/db_sakti';

async function main() {
  const client = new Client({ connectionString: DB_URL });
  try {
    await client.connect();
    
    console.log('Updating emails for dummy users...');
    
    await client.query('UPDATE users SET email = $1 WHERE nrp = $2', ['admindemo@gmail.com', 'admindemo']);
    await client.query('UPDATE users SET email = $1 WHERE nrp = $2', ['anggotademo@gmail.com', 'anggotademo']);
    
    console.log('Update Complete.');
  } catch (err) {
    console.error('Error during email update:', err);
  } finally {
    await client.end();
  }
}
main();
