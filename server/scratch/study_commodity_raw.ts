import pg from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

async function auditSpikes() {
  const client = new pg.Client({
    connectionString: "postgres://soma:kiyaisoma%21%40%23123@206.237.97.43:5432/db_indonesiamonitoring"
  });

  try {
    await client.connect();
    
    // 1. Get latest date
    const dateRes = await client.query("SELECT MAX(report_date) as d FROM nasional_commodity_sp2kp");
    const latestDate = dateRes.rows[0].d;
    console.log('Latest Date in DB:', latestDate);

    // 2. Check data 7 days ago
    const prevDateRes = await client.query(`SELECT COUNT(*) FROM nasional_commodity_sp2kp WHERE report_date = '${latestDate.toISOString().split('T')[0]}'::date - INTERVAL '7 days'`);
    console.log('Rows available 7 days ago:', prevDateRes.rows[0].count);

    // 3. Sample comparison
    const compRes = await client.query(`
      SELECT 
        commodity_code, 
        AVG(price::numeric) as cur_price,
        (SELECT AVG(price::numeric) FROM nasional_commodity_sp2kp p2 
         WHERE p2.commodity_code = p1.commodity_code 
         AND p2.report_date = '${latestDate.toISOString().split('T')[0]}'::date - INTERVAL '7 days') as prev_price
      FROM nasional_commodity_sp2kp p1
      WHERE report_date = '${latestDate.toISOString().split('T')[0]}'::date
      GROUP BY commodity_code
      LIMIT 10
    `);
    
    console.log('Comparison Samples:');
    compRes.rows.forEach(r => {
        const curPrice = parseFloat(r.cur_price);
        const prevPrice = parseFloat(r.prev_price || "0");
        const spike = prevPrice > 0 ? curPrice > (prevPrice * 1.05) : false;
        console.log(`- ${r.commodity_code}: Cur=${curPrice}, Prev=${prevPrice}, Spike=${spike}`);
    });

    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

auditSpikes();
