import { registerRemotes, loadRemote } from '@module-federation/enhanced/runtime';

// --- Selección runtime del manifest ---
// Regla: si estás en localhost -> manifest dev (puertos).
// Si estás desplegado (cualquier otro host) -> manifest prod (/v2/...).
function isLocalHost(): boolean {
  const h = window.location.hostname;
  return h === 'localhost' || h === '127.0.0.1' || h === '::1';
}

type MfMode = 'none' | 'all' | 'ireland' | 'portugal' | 'legacy';

function pickManifestFile(): string {
  // 1) Modo MF por query (?mf=all|none|ireland|...)
  const mf = (new URLSearchParams(window.location.search).get('mf') ?? 'all') as MfMode;

  // 2) Qué “familia” de manifest: dev(local) o prod(desplegado)
  const flavor = isLocalHost() ? 'dev' : 'prod';

  // 3) Elegimos archivo (tú puedes crear estos ficheros en /public)
  //    - module-federation.manifest.dev.all.json
  //    - module-federation.manifest.prod.all.json
  //    - module-federation.manifest.dev.none.json (vacío)
  //    - module-federation.manifest.prod.none.json (vacío)
  //
  // Si prefieres 1 solo por flavor (all) y controlar none desde código, también vale.
  return `module-federation.manifest.${flavor}.${mf}.json`;
}

const manifestFile = pickManifestFile();

// IMPORTANTE: relativo (./) para que en prod bajo /v2/ pida /v2/<manifest>
const manifestUrl = new URL(`./${manifestFile}`, window.location.href).toString();

fetch(manifestUrl, { cache: 'no-store' })
  .then((res) => {
    if (!res.ok) {
      throw new Error(`Failed to fetch MF manifest (${res.status}) from ${manifestUrl}`);
    }
    return res.json();
  })
  .then((remotes: Record<string, string>) =>
    Object.entries(remotes).map(([name, entry]) => ({ name, entry }))
  )
  .then((remotes) => registerRemotes(remotes))
  .then(() => {
    // Solo para debug manual en consola (opcional)
    (window as any).loadRemote = loadRemote;
  })
  .then(() => import('./bootstrap').catch((err) => console.error(err)))
  .catch((err) => {
    // Si falla el manifest, arranca el shell igualmente (sin remotes)
    console.error('MF bootstrap failed, continuing without remotes', err);
    import('./bootstrap').catch((e) => console.error(e));
  });