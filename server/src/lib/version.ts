export function getCommitHash(): string | undefined {
  const envSha = process.env.GIT_COMMIT || process.env.VERCEL_GIT_COMMIT_SHA || process.env.RENDER_GIT_COMMIT;
  if (envSha && typeof envSha === 'string' && envSha.length >= 7) return envSha.slice(0, 7);
  return undefined;
}
