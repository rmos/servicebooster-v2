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

function patchModuleFederationShared(cfg: any) {
  const plugins = cfg?.plugins ?? [];
  const mfPlugin = plugins.find((p: any) => p?.constructor?.name === 'ModuleFederationPlugin');
  const opts = mfPlugin?._options ?? mfPlugin?.options;

  if (opts) {
    opts.shared = {
      ...(opts.shared ?? {}),
      ...SHARED_POLICY,
    };
  }

  return cfg;
}

const cfg: any = withModuleFederation(mfConfig, { dts: false });

cfg.output = cfg.output || {};
cfg.output.publicPath = 'auto';

patchModuleFederationShared(cfg);

export default cfg;
