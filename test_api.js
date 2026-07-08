async function test() {
  try {
    const res = await fetch('http://localhost:8080/api/company/dashboard-stats?airline_code=IY');
    const json = await res.json();
    console.log('API response for IY:', json);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

test();
