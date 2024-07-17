import { Cooldowns } from '#adapters';
import { Client, GatewayIntentBits, Partials } from 'discord.js';

export class Albion extends Client {
  constructor(private cooldowns: Cooldowns) {
    super({
      intents: [GatewayIntentBits.DirectMessages, GatewayIntentBits.Guilds],
      allowedMentions: {
        repliedUser: false //Do not mention user in reply!
      },
      shards: 'auto'
    });
    this.login();
  }
}
