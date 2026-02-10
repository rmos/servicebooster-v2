export type MfeKey = 'ireland' | 'portugal' | 'legacy';

export interface MfeApp {
  key: MfeKey;
  title: string;
  route: `/${MfeKey}`;
  permission: string;
}

export const ALL_MFE_APPS: MfeApp[] = [
  { key: 'ireland', title: 'Ireland', route: '/ireland', permission: 'ACCESS-V1' },
  { key: 'portugal', title: 'Portugal', route: '/portugal', permission: 'ACCESS-PRE' },
  { key: 'legacy', title: 'Legacy', route: '/legacy', permission: 'ACCESS-AMBAR' },
];