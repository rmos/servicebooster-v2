import { registerRemotes, loadRemote } from '@module-federation/enhanced/runtime';

// --- Selección runtime del manifest ---
function isLocalHost(): boolean {
  const h = window.location.hostname;
  return h === 'localhost' || h === '127.0.0.1' || h === '::1';
}

type MfMode = 'none' | 'all' | 'ireland' | 'portugal' | 'legacy';

function pickManifestFile(): string {
  const qs = new URLSearchParams(window.location.search);
  const mf = (qs.get('mf') ?? 'all') as MfMode;

  const forced = qs.get('mfEnv');
  const flavor =
    forced === 'dev' || forced === 'prod'
      ? forced
      : (isLocalHost() ? 'dev' : 'prod');

  if (flavor === 'prod' && (isLocalHost())) {
    return `module-federation.manifest.prod.json`;
  } else if (isLocalHost()) {
    return `module-federation.manifest.dev.${mf}.json`;
  }

  return `module-federation.manifest.prod.json`;

  
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
    Object.entries(remotes).map(([name, entry]) => ({ name, entry, type: 'module' }))
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