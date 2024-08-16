import { commandModule, CommandType } from '@sern/handler';
import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import { publishConfig } from '#sern';
import { isValidSnowflake, owners } from '#adapters';

export default commandModule({
  type: CommandType.Slash,
  plugins: [
    publishConfig({
      contexts: [0, 1, 2],
      integrationTypes: ['Guild', 'User']
    })
  ],
  description: 'Add your in-game profile name to my database for quicker access to your profile.',
  options: [
    {
      name: 'set',
      type: ApplicationCommandOptionType.Subcommand,
      description: 'Set your own in-game tag in my memory for faster fetching.',
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: 'user-tag',
          description: 'Provide your tag as shown in game. Example: "~Peter Parker~#9732"',
          required: true
        }
      ]
    },
    {
      name: 'remove',
      description: 'Remove your in-game tag from my memory.',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: 'user_id',
          description: 'Provide the discord users id. None = you.',
          required: false
        }
      ]
    },
    {
      name: 'get',
      description: 'Retrieves a users in-game tag if available.',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: 'user',
          description: 'Provide the discord users id. None = you.',
          required: false
        }
      ]
    }
  ],
  execute: async (ctx, { deps }) => {
    const { options } = ctx.interaction;
    const [c, game, db] = [deps['@sern/client'], deps.nexon, deps.prisma];
    const { profile, userProfile } = db;
    const sub = options.getSubcommand() as 'get' | 'remove' | 'set';

    await ctx.interaction.deferReply();

    const actions = {
      get: async (): Promise<{ content: string } | { embeds: EmbedBuilder[] }> => {
        const user = options.getString('user') || ctx.userId;
        if (!isValidSnowflake(user) && !c.users.cache.get(user)) {
          return { content: 'That is an invalid user id!' };
        }
        const dbUser = await profile.findFirst({ where: { discordUserId: user } });
        if (!dbUser) {
          return { content: 'No info for that user!' };
        }

        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('User Profile')
          .addFields(
            { name: 'Username', value: dbUser.username },
            { name: 'Discord User Id', value: dbUser.discordUserId },
            { name: 'Discord Username', value: c.users.cache.get(user)?.username || dbUser.discordUsername }
          )
          .setTimestamp();

        return !ctx.guild
          ? { embeds: [embed] }
          : {
              embeds: [
                embed.setFooter({ text: 'Requested By: ' + ctx.user.username, iconURL: ctx.user.displayAvatarURL() })
              ]
            };
      },
      remove: async (): Promise<string> => {
        const _user_ = options.getString('user_id');
        if (!owners.includes(ctx.userId) && _user_) {
          return 'Option: `userId` is only available to bot owner!';
        }
        let _found = await profile.findFirst({ where: { discordUserId: ctx.userId } });
        if (owners.includes(ctx.userId) && _user_) {
          _found = await profile.findFirst({ where: { discordUserId: _user_ } });
        }
        if (!_found) return _user_ ? 'That user is not in my memory.' : 'You are not in my memory.';
        await profile.delete({ where: { id: _found.id } });
        return _user_ ? 'User has been removed from my memory.' : 'You have been removed from my memory!';
      },
      set: async (): Promise<string> => {
        const tag = options.getString('user-tag', true);
        const ouid = await game.getOuid(tag);
        if (ouid.includes('Invalid')) {
          return ouid;
        }

        const [p, u] = await Promise.all([
          userProfile.findUnique({ where: { username: tag } }),
          profile.findUnique({ where: { discordUserId: ctx.userId } })
        ]);

        if (u && p) {
          if (u.ouid === p.ouid) return 'You are already in my memory. No need for an update.';
          if (u.ouid !== ouid || p.ouid !== ouid) {
            await Promise.all([
              profile.update({ where: { id: u.id }, data: { ouid, discordUsername: ctx.user.username } }),
              userProfile.update({ where: { id: p.id }, data: { ouid, username: tag, updatedAt: new Date() } })
            ]);
            return 'You are already in my memory, but I have updated your info.';
          }
          return 'You are already in my memory.';
        }

        await Promise.all([
          profile.create({
            data: { discordUserId: ctx.userId, discordUsername: ctx.user.username, ouid, username: tag }
          }),
          userProfile.create({ data: { ouid, username: tag, updatedAt: new Date() } })
        ]);
        return 'I have saved your info!';
      }
    };

    type ActionKey = keyof typeof actions;

    const result = await actions[sub as ActionKey]();
    return ctx.interaction.editReply(result);
  }
});
