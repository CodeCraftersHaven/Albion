/**
 * @plugin
 * @author @Peter-MJ-Parker [<@371759410009341952>]
 * @version 1.0.0
 * @example
 * ```ts
 * export default commandModule({
 *     type: CommandType.Slash, //plugin can be used with any command type
 *     plugins: [cooldown({ module: "slash", cooldownType: CooldownTypes.global, duration: 300 })],
 *     execute: ctx => {
 *         ctx.reply("");
 *     }
 * })
 * ```
 * @end
 */

import { InternalCooldownConfig, owners } from '#adapters';
import { CommandType, controller, CommandControlPlugin, SDT } from '@sern/handler';
import {
  AnySelectMenuInteraction,
  ButtonInteraction,
  ChatInputCommandInteraction,
  ComponentType,
  ContextMenuCommandInteraction,
  InteractionType,
  ModalSubmitInteraction,
  UserContextMenuCommandInteraction
} from 'discord.js';

export function slashCooldown(usage: Omit<InternalCooldownConfig, 'userId' | 'actionId' | 'guildId' | 'channelId'>) {
  return CommandControlPlugin<CommandType.Slash>(async ({ interaction }, tbd) => {
    return await getResult(interaction, usage, tbd);
  });
}

export function componentCooldown(
  usage: Omit<InternalCooldownConfig, 'userId' | 'actionId' | 'guildId' | 'channelId'>
) {
  return CommandControlPlugin<
    | CommandType.Button
    | CommandType.Modal
    | CommandType.ChannelSelect
    | CommandType.MentionableSelect
    | CommandType.RoleSelect
    | CommandType.StringSelect
    | CommandType.UserSelect
  >(async (interaction, tbd) => {
    return await getResult(interaction, usage, tbd);
  });
}

export function contextCooldown(usage: Omit<InternalCooldownConfig, 'userId' | 'actionId' | 'guildId' | 'channelId'>) {
  return CommandControlPlugin<CommandType.CtxMsg | CommandType.CtxUser>(async (interaction, tbd) => {
    return await getResult(interaction, usage, tbd);
  });
}

async function getResult(
  interaction:
    | ChatInputCommandInteraction
    | ButtonInteraction
    | AnySelectMenuInteraction
    | ContextMenuCommandInteraction
    | UserContextMenuCommandInteraction
    | ModalSubmitInteraction,
  usage: Omit<InternalCooldownConfig, 'userId' | 'actionId' | 'guildId' | 'channelId'>,
  tbd: SDT
) {
  const { deps } = tbd;
  const [client, cooldowns] = [deps['@sern/client'], deps['cooldowns']];
  let actionId = '';
  if (
    interaction instanceof ChatInputCommandInteraction ||
    interaction instanceof ContextMenuCommandInteraction ||
    interaction instanceof UserContextMenuCommandInteraction
  ) {
    actionId = `command_${interaction.commandName}`;
  } else {
    switch (interaction.type) {
      case InteractionType.MessageComponent:
        switch (interaction.componentType) {
          case ComponentType.Button:
            actionId = `button_${interaction.customId}`;
            break;
          case ComponentType.StringSelect ||
            ComponentType.ChannelSelect ||
            ComponentType.MentionableSelect ||
            ComponentType.RoleSelect ||
            ComponentType.UserSelect:
            actionId = `menu_${interaction.customId}`;
            break;
          default:
            break;
        }
        break;

      case InteractionType.ModalSubmit:
        actionId = `modal_${interaction.customId}`;
        break;
      default:
        break;
    }
  }
  const cooldownUsage: InternalCooldownConfig = {
    cooldownType: usage.cooldownType,
    duration: usage.duration,
    userId: interaction.user.id,
    actionId,
    guildId: interaction.guildId!,
    channelId: interaction.channelId!
  };
  const result = await cooldowns.start(cooldownUsage);
  if (typeof result === 'object') {
    await client.users.cache
      .get(owners[0])
      ?.send({
        content: result.main
      })
      .catch(() => null);
    await interaction.reply({
      content: result.reply,
      ephemeral: true
    });
    return controller.stop();
  } else if (typeof result === 'string') {
    await interaction.reply({
      content: result,
      ephemeral: true
    });
    return controller.stop();
  } else {
    return controller.next();
  }
}
