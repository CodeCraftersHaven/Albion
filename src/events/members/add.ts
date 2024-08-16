import { ids } from '#adapters';
import { discordEvent } from '@sern/handler';
import { Events } from 'discord.js';

export default discordEvent({
  name: Events.GuildMemberAdd,
  async execute(member) {
    if (member.guild.id !== ids.main_guild_id) return;
    const guild = member.client.guilds.cache.get(ids.main_guild_id);

    if (!guild) return;
    const newRole = guild.roles.cache.find(role => role.name === 'Newbie');

    if (!newRole) return;
    await member.roles.add(newRole).catch(console.error);
  }
});
