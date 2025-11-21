export async function withTimeout<T>(p: Promise<T>, ms: number, label?: string): Promise<T> {
  if (!ms || ms <= 0) return p;
  let timer: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`[timeout] ${label || 'operation'} exceeded ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([p, timeoutPromise]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
