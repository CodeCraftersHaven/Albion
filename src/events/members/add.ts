import { Asset } from '#adapters';
import { ChannelIds } from '#bot';
import { discordEvent } from '@sern/handler';
import { Events } from 'discord.js';

const ids = await Asset<ChannelIds>({ p: 'config.json', encoding: 'json' });

export default discordEvent({
  name: Events.GuildMemberAdd,
  async execute(member) {
    const guild = member.client.guilds.cache.get(ids.main_guild_id);

    if (!guild) return;
    const newRole = guild.roles.cache.find(role => role.name === 'Newbie');

    if (!newRole) return;
    await member.roles.add(newRole).catch(console.error);
  }
});
