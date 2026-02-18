import { withModuleFederation } from '@nx/module-federation/angular';
import mfConfig from './module-federation.config';

const NG = '21.1.4';

export const SHARED_POLICY: any = {
  '@angular/core': { singleton: true, strictVersion: true, requiredVersion: NG},
  '@angular/common': { singleton: true, strictVersion: true, requiredVersion: NG},
  '@angular/common/http': { singleton: true, strictVersion: true, requiredVersion: NG},
  '@angular/router': { singleton: true, strictVersion: true, requiredVersion: NG},

  '@angular/platform-browser': { singleton: true, strictVersion: true, requiredVersion: NG},
  '@angular/platform-browser/animations': { singleton: true, strictVersion: true, requiredVersion: NG},
  '@angular/animations': { singleton: true, strictVersion: true, requiredVersion: NG},

  rxjs: { singleton: true, strictVersion: true, requiredVersion: false },
  'zone.js': { singleton: true, strictVersion: true, requiredVersion: false },
};

export function patchShared(cfg: any) {
  const plugins = cfg?.plugins ?? [];
  const mfPlugin = plugins.find((p: any) => p?.constructor?.name === 'ModuleFederationPlugin');
  const opts = mfPlugin?._options ?? mfPlugin?.options;
  if (opts) {
    opts.shared = { ...(opts.shared ?? {}), ...SHARED_POLICY };
  }
}

export default async function (config: any) {
  const mf = await withModuleFederation(mfConfig, { dts: false });
  const cfg = mf(config);

  patchShared(cfg);

  return cfg;
}