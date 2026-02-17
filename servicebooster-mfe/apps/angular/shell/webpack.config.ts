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

export default function (config: any, context: any) {
  const mfWebpack = withModuleFederation(mfConfig, { dts: false }) as any;
  config.plugins = [...(config.plugins ?? []), ...(mfWebpack.plugins ?? [])];

  patchShared(config);
  return config;
}
