(async () => {
  const res = await fetch('http://localhost:4000/api/email-intake', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fromEmail: 'someone@unknown.tld', subject: 'Test', bodyText: 'Help' })
  });
  if (res.status !== 401) {
    console.error('emailIntakeMissingFirm.spec: expected 401, got', res.status, await res.text());
    process.exit(1);
  }
  console.log('emailIntakeMissingFirm.spec passed');
  process.exit(0);
})().catch((e) => { console.error('emailIntakeMissingFirm.spec error', e); process.exit(1); });