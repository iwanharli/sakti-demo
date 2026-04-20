import pg from 'pg';

const connectionString = 'postgres://soma:kiyaisoma%21%40%23123@206.237.97.43:5432/db_indonesiamonitoring';
const pool = new pg.Pool({ connectionString });

async function checkKamtibmas() {
  try {
    const res = await pool.query(`
      WITH latest_dates AS (
        SELECT MAX(report_date) as max_date FROM nasional_kamtibmas_case_data
      ),
      prev_dates AS (
        SELECT MAX(report_date) as prev_date 
        FROM nasional_kamtibmas_case_data 
        WHERE report_date < (SELECT max_date FROM latest_dates)
      ),
      stats AS (
        SELECT 
          report_date,
          sub_category,
          SUM(value) as total
        FROM nasional_kamtibmas_case_data
        WHERE sub_category IN ('kejahatan_total', 'gangguan_total', 'pelanggaran_total', 'bencana_total')
        AND report_date IN ( (SELECT max_date FROM latest_dates), (SELECT prev_date FROM prev_dates) )
        GROUP BY report_date, sub_category
      )
      SELECT 
        report_date,
        SUM(total) as daily_total,
        json_object_agg(sub_category, total) as breakdown
      FROM stats
      GROUP BY report_date
      ORDER BY report_date DESC;
    `);

    console.log(JSON.stringify(res.rows, null, 2));
    await pool.end();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkKamtibmas();
