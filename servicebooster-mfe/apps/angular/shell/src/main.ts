import { registerRemotes, loadRemote } from '@module-federation/enhanced/runtime';

type MfMode = 'none' | 'ireland' | 'all';

// Por defecto: none (evitas ruido y errores si no levantas remotes)
const mf = (new URLSearchParams(location.search).get('mf') as MfMode) ?? 'none';

const manifestUrl =
  mf === 'none'
    ? '/module-federation.manifest.empty.json'
    : mf === 'ireland'
      ? '/module-federation.manifest.ireland.json'
      : '/module-federation.manifest.all.json';

async function bootstrap() {
  try {
    const res = await fetch(manifestUrl, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Failed to fetch MF manifest (${res.status}) from ${manifestUrl}`);
    }

    const manifest = (await res.json()) as Record<string, string>;

    const remotes = Object.entries(manifest).map(([name, entry]) => ({
      name,
      entry,
      // IMPORTANT: remoteEntry.mjs => ES module
      type: 'module' as const,
    }));

    // Solo registra si hay algo
    if (remotes.length > 0) {
      await registerRemotes(remotes as any);
    }

    // Debug desde consola (opcional)
    (window as any).loadRemote = loadRemote;
    (window as any).__mfManifestUrl = manifestUrl;
    (window as any).__mfRemotes = remotes;

    await import('./bootstrap');
  } catch (err) {
    console.error('[shell] Federation bootstrap failed:', err);
    // Aun así intentamos arrancar el shell para que no se quede “en blanco”
    await import('./bootstrap');
  }
}

bootstrap();