//@ts-nocheck
/**
 * @plugin
 * Disables a command entirely, for whatever reasons you may need.
 *
 * @author @jacoobes [<@182326315813306368>]
 * @author @Peter-MJ-Parker [<@371759410009341952>]
 * @version 2.1.0
 * @example
 * ```ts
 * import { disable } from "../plugins/disable";
 * import { commandModule } from "@sern/handler";
 * export default commandModule({
 *  plugins: [ disable() ],
 *  execute: (ctx) => {
 * 		//your code here
 *  }
 * })
 * ```
 * @end
 */
import { CommandType, CommandControlPlugin, controller } from '@sern/handler';
import { InteractionReplyOptions, MessageReplyOptions } from 'discord.js';

export function disable(onFail?: string) {
  return CommandControlPlugin<CommandType.Both>(async (ctx) => {
    if (onFail !== undefined) {
      //response to say the command is disabled with users response.
      await ctx.reply({ content: onFail, ephemeral: true });
    }
    //this function tells the bot to reply to an interaction so it doesn't seem like it fails (in case there is no onFail message).
    if (onFail === undefined) {
      onFail = 'This command is disabled.';
      await ctx.reply({ content: onFail, ephemeral: true });
    }
    //stop the command from running
    return controller.stop();
  });
}
