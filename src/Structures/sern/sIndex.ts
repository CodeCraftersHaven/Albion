export * from './load.js';
export * from './logger.js';
export * from './plugins/cooldown.js';
export * from './plugins/permCheck.js';
export * from './plugins/subcommandPermCheck.js';

export enum IntegrationContextType {
  GUILD = 0,
  BOT_DM = 1,
  PRIVATE_CHANNEL = 2
}

export const allContexts: NonEmptyArray<IntegrationContextType> = [
  IntegrationContextType.BOT_DM,
  IntegrationContextType.GUILD,
  IntegrationContextType.PRIVATE_CHANNEL
];
type NonEmptyArray<T> = [T, ...T[]];

type ContextType = IntegrationContextType | 0 | 1 | 2;
