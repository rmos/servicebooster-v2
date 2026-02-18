import { createInstance } from '@module-federation/enhanced/runtime';

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
    forced === 'dev' || forced === 'prod' ? forced : isLocalHost() ? 'dev' : 'prod';

  if (flavor === 'prod') return `module-federation.manifest.prod.json`;
  return `module-federation.manifest.dev.${mf}.json`;
}

const manifestFile = pickManifestFile();
const manifestUrl = new URL(`./${manifestFile}`, window.location.href).toString();

const mf = createInstance({ name: 'shell', remotes: [] as any[] });

fetch(manifestUrl, { cache: 'no-store' })
  .then(async (res) => {
    if (!res.ok) {
      throw new Error(`Failed to fetch MF manifest (${res.status}) from ${manifestUrl}`);
    }
    return (await res.json()) as Record<string, string>;
  })
  .then((remotes) =>
    Object.entries(remotes).map(([name, entry]) => ({ name, entry, type: 'module' }))
  )
  .then((remotes) => (mf as any).registerRemotes(remotes))
  .then(() => {

    (window as any).mfLoadRoutes = (remoteName: string) =>
      (mf as any).loadRemote(`${remoteName}/Routes`);

    // opcional: exponer instancia para debug
    (window as any).mf = mf;
  })
  .then(() => import('./bootstrap'))
  .catch((err) => {
    console.error('MF init failed, starting shell without remotes', err);

    // Aun si MF falla, el shell arranca
    (window as any).mfLoadRoutes = () =>
      Promise.reject(new Error('MF runtime not initialized'));

    import('./bootstrap').catch((e) => console.error(e));
  });