export type LegacyEnv = { id: string | number } | null;

export function setLegacySession(opts: {
  token: string;
  credential: string;
  env?: LegacyEnv;
}) {
  const { token, credential, env } = opts;

  // ngStorage (lo que realmente acaba usando $sessionStorage)
  sessionStorage.setItem('ngStorage-jwt', JSON.stringify(token));
  sessionStorage.setItem('ngStorage-credential', JSON.stringify(credential));
  if (env) sessionStorage.setItem('ngStorage-env', JSON.stringify(env));

  // redundante: por si hay código legacy que lee directo
  sessionStorage.setItem('jwt', token);
  sessionStorage.setItem('credential', credential);
  if (env) sessionStorage.setItem('env', JSON.stringify(env));
}