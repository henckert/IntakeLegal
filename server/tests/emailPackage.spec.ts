(async () => {
  // Create an intake via email intake first
  const create = await fetch('http://localhost:4000/api/email-intake', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Firm-Id': 'demo', 'X-User-Id': 'tester-package' },
    body: JSON.stringify({ fromEmail: 'client@demo.com', subject: 'Package please', bodyText: 'Accident with minor injuries.' })
  });
  if (create.status !== 200) {
    console.error('emailPackage.spec: setup failed', create.status, await create.text());
    process.exit(1);
  }
  const cj = await create.json();
  const id = cj.id;

  const res = await fetch(`http://localhost:4000/api/intakes/${id}/email-package`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Firm-Id': 'demo', 'X-User-Id': 'tester-package' },
    body: JSON.stringify({ recipientEmail: 'client@demo.com' })
  });
  if (res.status !== 200) {
    console.error('emailPackage.spec: expected 200, got', res.status, await res.text());
    process.exit(1);
  }
  const j = await res.json();
  if (!j?.ok) {
    console.error('emailPackage.spec: expected ok true');
    process.exit(1);
  }
  console.log('emailPackage.spec passed');
  process.exit(0);
})().catch((e) => { console.error('emailPackage.spec error', e); process.exit(1); });