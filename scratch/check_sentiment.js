import pg from 'pg';

const connectionString = 'postgresql://pendekar_sakti:s4kt1m4ndr4gun%40666@206.237.97.43:5432/db_sakti';
const pool = new pg.Pool({ connectionString });

async function checkSentiment() {
  try {
    const latestDateRes = await pool.query('SELECT MAX(post_timestamp::date) as max_d FROM sample_sosmed_post_data');
    const targetDate = latestDateRes.rows[0].max_d;

    if (!targetDate) {
      console.log("No data found in sample_sosmed_post_data");
      await pool.end();
      return;
    }

    const formattedDate = new Date(targetDate).toISOString().split('T')[0];

    const res = await pool.query(`
      SELECT 
        sentiment, 
        COUNT(*)::int as count
      FROM sample_sosmed_post_data 
      WHERE post_timestamp::date = $1
      GROUP BY sentiment
      ORDER BY count DESC;
    `, [formattedDate]);

    console.log(`Target Date: ${formattedDate}`);
    console.log(JSON.stringify(res.rows, null, 2));

    const total = res.rows.reduce((acc, curr) => acc + curr.count, 0);
    const negative = res.rows.find(r => r.sentiment === 'Negatif')?.count || 0;
    const negPct = ((negative / total) * 100).toFixed(1);

    console.log(`\nCalculation: (${negative} / ${total}) * 100 = ${negPct}%`);

    await pool.end();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkSentiment();
