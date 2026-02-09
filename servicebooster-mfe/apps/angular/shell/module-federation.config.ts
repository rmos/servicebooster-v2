import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
  name: 'shell',
  remotes: ['ireland', 'portugal', 'legacy'],
};

export default config;
