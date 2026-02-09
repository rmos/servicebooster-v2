import { withModuleFederation } from '@nx/module-federation/angular';
import mfConfig from './module-federation.config';

const config = withModuleFederation(mfConfig, { dts: false });

// Fuerza publicPath para que los chunks salgan del mismo host del remoteEntry
(config as any).output = (config as any).output || {};
(config as any).output.publicPath = 'auto';

export default config;
