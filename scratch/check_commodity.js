import pg from 'pg';

const connectionString = 'postgres://soma:kiyaisoma%21%40%23123@206.237.97.43:5432/db_indonesiamonitoring';
const pool = new pg.Pool({ connectionString });

async function checkCommodityHET() {
  try {
    const res = await pool.query(`
      WITH thresholds(code, het_price) AS (
        VALUES 
          ('beras-medium', 10900),
          ('beras-premium', 13900),
          ('bawang-merah', 32000),
          ('bawang-putih-honan', 30000),
          ('cabai-merah-besar', 45000),
          ('cabai-rawit-merah', 55000),
          ('daging-ayam-ras', 35000),
          ('daging-sapi-paha-belakang', 140000),
          ('gula-pasir-curah', 14500),
          ('minyak-goreng-curah', 14000)
      ),
      sp2kp_national_avg AS (
        SELECT commodity_code, AVG(price::numeric) as avg_price 
        FROM nasional_commodity_sp2kp 
        WHERE report_date = (SELECT MAX(report_date) FROM nasional_commodity_sp2kp)
        GROUP BY commodity_code
      ),
      pihps_national_avg AS (
        SELECT commodity_code, AVG(price::numeric) as avg_price 
        FROM nasional_pihps_commodity_regional_prices 
        WHERE report_date = (SELECT MAX(report_date) FROM nasional_pihps_commodity_regional_prices)
        AND market_type = 'pasar tradisional'
        GROUP BY commodity_code
      )
      SELECT 
        (SELECT COUNT(*)::int FROM sp2kp_national_avg s JOIN thresholds t ON s.commodity_code = t.code WHERE s.avg_price > t.het_price) as sp2kp_count,
        (SELECT COUNT(*)::int FROM pihps_national_avg p JOIN thresholds t ON p.commodity_code = t.code WHERE p.avg_price > t.het_price) as pihps_count,
        (SELECT MAX(report_date) FROM nasional_commodity_sp2kp) as sp2kp_latest_date,
        (SELECT MAX(report_date) FROM nasional_pihps_commodity_regional_prices) as pihps_latest_date;
    `);

    console.log(JSON.stringify(res.rows, null, 2));
    
    // Also get the list of commodities above HET for transparency
    const details = await pool.query(`
      WITH thresholds(code, het_price) AS (
        VALUES 
          ('beras-medium', 10900),
          ('beras-premium', 13900),
          ('bawang-merah', 32000),
          ('bawang-putih-honan', 30000),
          ('cabai-merah-besar', 45000),
          ('cabai-rawit-merah', 55000),
          ('daging-ayam-ras', 35000),
          ('daging-sapi-paha-belakang', 140000),
          ('gula-pasir-curah', 14500),
          ('minyak-goreng-curah', 14000)
      ),
      sp2kp_national_avg AS (
        SELECT commodity_code, AVG(price::numeric) as avg_price 
        FROM nasional_commodity_sp2kp 
        WHERE report_date = (SELECT MAX(report_date) FROM nasional_commodity_sp2kp)
        GROUP BY commodity_code
      )
      SELECT s.commodity_code, s.avg_price, t.het_price, (s.avg_price - t.het_price) as diff
      FROM sp2kp_national_avg s 
      JOIN thresholds t ON s.commodity_code = t.code 
      WHERE s.avg_price > t.het_price;
    `);
    
    console.log("\nCommodities Above HET (SP2KP):");
    console.log(JSON.stringify(details.rows, null, 2));

    await pool.end();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkCommodityHET();
