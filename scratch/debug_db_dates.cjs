const { Client } = require('pg');
const connectionString = process.env.DATABASE_SECONDARY_URL || 'postgresql://postgres:postgres@localhost:5433/sakti_db';

async function checkData() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    const res = await client.query('SELECT MAX(report_date) as latest_date, COUNT(*) as total FROM nasional_kamtibmas_case_data');
    console.log('Case Data Summary:', res.rows[0]);
    
    // Check for today
    const res2 = await client.query('SELECT COUNT(*) as today_count FROM nasional_kamtibmas_case_data WHERE report_date = CURRENT_DATE');
    console.log('Today Count:', res2.rows[0]);
    
    // Check for last 7 days
    const res3 = await client.query("SELECT COUNT(*) as last_7_days FROM nasional_kamtibmas_case_data WHERE report_date >= CURRENT_DATE - INTERVAL '7 days'");
    console.log('Last 7 Days Count:', res3.rows[0]);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

checkData();
