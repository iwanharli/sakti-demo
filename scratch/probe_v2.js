
const API_BASE = 'http://localhost:8440/api';

async function test(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return { url, status: res.status };
  } catch (e) {
    return { url, status: 'ERROR' };
  }
}

async function run() {
  const endpoints = [
    '/analytics/kamtibmas-index',
    '/analytics/risk-scores',
    '/analytics/food-risk',
    '/analytics/sosmed-sentiment',
    '/analytics/issues-all',
    '/analytics/ai-summary',
    '/ai/summary',
    '/kamtibmas/detail',
    '/get_risiko_detail',
    '/get_ai_summary',
    '/get_kamtibmas_detail'
  ];

  const results = [];
  for (const ep of endpoints) {
    const res = await test(API_BASE + ep);
    results.push(res);
  }

  console.log(JSON.stringify(results, null, 2));
}

run();
