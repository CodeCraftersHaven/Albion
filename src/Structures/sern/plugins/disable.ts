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
import { type CommandType, CommandControlPlugin, controller } from '@sern/handler';

export function disable(onFail?: string) {
  return CommandControlPlugin<CommandType.Both>(async ctx => {
    if (onFail !== undefined) {
      await ctx.reply({ content: onFail, ephemeral: true });
    }
    if (onFail === undefined) {
      onFail = 'This command is disabled.';
      await ctx.reply({ content: onFail, ephemeral: true });
    }
    return controller.stop();
  });
}
