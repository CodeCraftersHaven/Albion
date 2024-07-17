/**
 * @plugin
 * Inspired by the plugin "requirePermission" created by Benzo-Fury & needhamgary, this plugin will set permissions for specific subcommands without manually writing it into the code.
 *
 * @author @Peter-MJ-Parker [<@371759410009341952>]
 * @version 1.0
 * @example
 * ```ts
 * import { subcommandPermCheck } from "../plugins/subcommandPerms";
 * import { commandModule, CommandType } from "@sern/handler";
 * import { PermissionFlagBits } from "discord.js";
 * export default commandModule({
 *  type: CommandType.Slash,
 *  plugins: [
 *   subcommandPermCheck({
 *    [
 *      { subcommand: "string", perms: [PermissionFlagBits.Administrator] }, //subcommand is the name of your subcommand
 *      { subcommand: "number", perms: [PermissionFlagBits.SendMessages, PermissionFlagBits.UseVAD] }
 *    ],
 *   all: true, //all = Require the member to have all perms stated or at least one?
 *   "OPTIONAL - respond to user with this message or default."
 *   })
 *  ],
 *  execute: ({ interaction }) => {
 * 		//your code here
 *  }
 * })
 * ```
 * @end
 */

import { PermissionsBitField, type GuildMember, type PermissionResolvable, type TextChannel } from 'discord.js';
import { type CommandType, CommandControlPlugin, controller } from '@sern/handler';

export function subcommandPermCheck(opts: Options) {
  return CommandControlPlugin<CommandType.Slash>(async (ctx) => {
    if (ctx.guild === null || ctx.isMessage()) {
      ctx
        .reply("PermCheck > A command stopped because it was used in dm's or is a possibly a text command.")
        .then((m) =>
          setTimeout(async () => {
            await m.delete();
          }, 5000)
        );
      return controller.stop();
    }
    const member = ctx.member as GuildMember;
    const subcommands = opts.list;
    let subs = ctx.interaction.options.getSubcommand();

    if (!subcommands.some((opt) => opt.subcommand === subs)) {
      throw new Error("You provided a subcommand name which doesn't exist in given command.", {
        cause: `${subs} not found on command: ${ctx.interaction.commandName}.`
      });
      return controller.stop();
    }
    for (const sub of subcommands) {
      const each = `${permsToString(sub.perms)}`;
      const { all } = opts;
      if (all === true) {
        if (!member.permissionsIn(ctx.channel as TextChannel).has(sub.perms)) {
          let content =
            opts.response ??
            `You are required to have all of the following permissions to run this subcommand in this channel:\n${each}`;
          await ctx.reply({
            content,
            ephemeral: true
          });
          return controller.stop();
        }
      } else {
        if (!member.permissionsIn(ctx.channel as TextChannel).any(sub.perms)) {
          let content =
            opts.response ??
            `You are required to have at least one of the following permissions to run this subcommand in this channel:\n${each}`;
          await ctx.reply({
            content,
            ephemeral: true
          });
          return controller.stop();
        }
      }
    }
    return controller.next();
  });
}

interface Options {
  list: { subcommand: string; perms: PermissionResolvable[] }[];
  all: boolean;
  response?: string;
}

const permsToString = (...perms: PermissionResolvable[]) =>
  new PermissionsBitField(perms)
    .toArray()
    .map((perm) => `\`${perm}\``)
    .join(', ');
