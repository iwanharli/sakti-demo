
const API_BASE = 'http://localhost:8440/api';
// We need a token to test authFetch, but we can't easily get it here.
// However, I can try to find the token from the session if I were in the browser.
// Since I'm in a script, I'll just try to see if the endpoints exist (401 is better than 404).

async function probe(path) {
  try {
    const res = await fetch(`${API_BASE}${path}`);
    console.log(`PROBE ${path}: ${res.status} ${res.statusText}`);
  } catch (e) {
    console.log(`PROBE ${path}: ERROR ${e.message}`);
  }
}

const paths = [
  '/analytics/kamtibmas-index?region=Nasional',
  '/analytics/risiko-detail?region=62',
  '/analytics/ai-summary?region=62',
  '/get_risiko_detail?region=62',
  '/get_kamtibmas_detail?year=2026',
  '/get_ai_summary',
  '/get_all_issues',
  '/mapeco/api/get_risiko_detail?region=62'
];

async function run() {
  for (const p of paths) {
    await probe(p);
  }
}

run();
