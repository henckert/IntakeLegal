(async () => {
  const res = await fetch('http://localhost:4000/api/email-intake', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Firm-Id': 'demo', 'X-User-Id': 'tester-email' },
    body: JSON.stringify({ fromEmail: 'client@demo.com', subject: 'Need help', bodyText: 'I had an accident and suffered whiplash.' })
  });
  if (res.status !== 200) {
    console.error('emailIntake.spec: expected 200, got', res.status, await res.text());
    process.exit(1);
  }
  const j = await res.json();
  if (!j?.summaryText) {
    console.error('emailIntake.spec: missing summaryText');
    process.exit(1);
  }
  console.log('emailIntake.spec passed');
  process.exit(0);
})().catch((e) => { console.error('emailIntake.spec error', e); process.exit(1); });