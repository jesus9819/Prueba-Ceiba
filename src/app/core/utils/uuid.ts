export function uuid(): string {
  // `crypto.randomUUID` is available in modern browsers; fallback for test envs.
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

