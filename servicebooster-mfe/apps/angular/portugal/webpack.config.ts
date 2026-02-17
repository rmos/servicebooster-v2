import { withModuleFederation } from '@nx/module-federation/angular';
import mfConfig from './module-federation.config';

const SHARED_POLICY: any = {
  '@angular/core': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
  '@angular/common': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
  '@angular/common/http': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
  '@angular/router': { singleton: true, strictVersion: true, requiredVersion: 'auto' },

  '@angular/platform-browser': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
  '@angular/platform-browser/animations': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
  '@angular/animations': { singleton: true, strictVersion: true, requiredVersion: 'auto' },

  rxjs: { singleton: true, strictVersion: true, requiredVersion: 'auto' },
  'zone.js': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
};

function patchShared(cfg: any) {
  const plugins = cfg?.plugins ?? [];
  const mfPlugin = plugins.find((p: any) => p?.constructor?.name === 'ModuleFederationPlugin');
  const opts = mfPlugin?._options ?? mfPlugin?.options;
  if (opts) {
    opts.shared = { ...(opts.shared ?? {}), ...SHARED_POLICY };
  }
}

export default function (config: any /* webpack.Configuration */, context: any) {
  // 1) aplica config base de MF sobre el config que genera Nx
  const mfWebpack = withModuleFederation(mfConfig, { dts: false }) as any;

  // 2) merge mínimo: plugins + output. (sin pisar todo)
  config.plugins = [...(config.plugins ?? []), ...(mfWebpack.plugins ?? [])];

  config.output = config.output || {};
  config.output.publicPath = 'auto';

  // 3) parchear shared en el plugin de MF (el que acabamos de añadir)
  patchShared(config);

  return config;
}
