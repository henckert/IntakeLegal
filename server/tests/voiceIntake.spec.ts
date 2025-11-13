import fs from 'fs';
import path from 'path';

(async () => {
  const boundary = '----voiceBoundary' + Date.now();
  const form = [] as string[];
  const fakeAudioPath = path.join(process.cwd(), 'server', 'tests', 'fixtures', 'silent.wav');
  // Generate a tiny fake wav header (not a valid audio, but our mock path will still proceed)
  if (!fs.existsSync(path.dirname(fakeAudioPath))) fs.mkdirSync(path.dirname(fakeAudioPath), { recursive: true });
  if (!fs.existsSync(fakeAudioPath)) fs.writeFileSync(fakeAudioPath, Buffer.from('RIFF\x00\x00\x00WAVEfmt '));

  const fileContent = fs.readFileSync(fakeAudioPath);
  const filePart = Buffer.concat([
    Buffer.from(`--${boundary}\r\n`),
    Buffer.from('Content-Disposition: form-data; name="audio"; filename="silent.wav"\r\n'),
    Buffer.from('Content-Type: audio/wav\r\n\r\n'),
    fileContent,
    Buffer.from(`\r\n--${boundary}--\r\n`)
  ]);

  const res = await fetch('http://localhost:4000/api/intake/demo/voice', {
    method: 'POST',
    headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}`, 'X-Firm-Id': 'demo', 'X-User-Id': 'tester-voice' },
    body: filePart as any,
  });
  if (res.status !== 200) {
    console.error('voiceIntake.spec: expected 200, got', res.status, await res.text());
    process.exit(1);
  }
  const j = await res.json();
  if (!j?.summaryText) {
    console.error('voiceIntake.spec: missing summaryText');
    process.exit(1);
  }
  console.log('voiceIntake.spec passed');
  process.exit(0);
})().catch((e) => { console.error('voiceIntake.spec error', e); process.exit(1); });