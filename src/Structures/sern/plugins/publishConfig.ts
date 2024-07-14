import { CommandInitPlugin, controller } from '@sern/handler';

export enum IntegrationContextType {
  GUILD = 0,
  BOT_DM = 1,
  PRIVATE_CHANNEL = 2
}

interface ValidPublishOptions {
  guildIds?: NonEmptyArray<`${number}`> | undefined;
  defaultMemberPermissions?: NonEmptyArray<bigint> | null;
  integrationTypes?: NonEmptyArray<'User' | 'Guild'>;
  contexts?:
    | NonEmptyArray<IntegrationContextType>
    | NonEmptyArray<0 | 1 | 2>
    | NonEmptyArray<'Guild' | 'Bot DM' | 'Private Chanel'>;
}
type NonEmptyArray<T> = [T, ...T[]];

/**
 * the publishConfig plugin.
 * If your commandModule requires extra properties such as publishing for certain guilds, you would
 * put those options in there.
 * @param {ValidPublishOptions} config options to configure how this module is published
 */
export const publishConfig = (config: ValidPublishOptions) => {
  return CommandInitPlugin(({ module, absPath }) => {
    if ((module.type & PUBLISHABLE) === 0) {
      //@ts-ignore
      return controller.stop('Cannot publish this module; Not of type Both,Slash,CtxUsr,CtxMsg.');
    }
    let _config = config;
    if (typeof _config === 'function') {
      _config = _config(absPath, module);
    }
    const { contexts, defaultMemberPermissions, integrationTypes } = _config;
    //adding extra configuration
    Reflect.set(module, PUBLISH, {
      guildIds: _config.guildIds,
      default_member_permissions: serializePermissions(defaultMemberPermissions),
      integration_types: integrationTypes,
      contexts
    });
    return controller.next();
  });
};
