import {commandModule, CommandType, SlashCommand} from '@sern/handler';
import {ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder} from 'discord.js';

export default commandModule({
  type: CommandType.Slash,
  description: 'Shows bot info.',
  execute: async ({interaction}) => {
    return await interaction.reply({
      embeds: [
        new EmbedBuilder({
          title: 'Albion Guide Help',
          color: Colors.Blurple,
          description: `Albion Guide is a Discord App to get information about [The First Descendant Game](<https://tfd.nexon.com/en/main>) and basic in-game user data made by [© NEXON Korea Corp. & NEXON Games Co, LTD](<https://www.nexon.com/main/en>). By using this app, you agree to the Terms of Service and Privacy Policy.`
        })
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>({
          components: [
            new ButtonBuilder({
              style: ButtonStyle.Link,
              label: 'Invite',
              url: 'https://discord.com/oauth2/authorize?client_id=1263202205851193447'
            }),
            new ButtonBuilder({
              style: ButtonStyle.Link,
              label: 'ToS',
              url: 'https://cc-haven.net/bot-tos'
            }),
            new ButtonBuilder({
              style: ButtonStyle.Link,
              label: 'Privacy Policy',
              url: 'https://cc-haven.net/bot-privacy'
            }),
            new ButtonBuilder({
              style: ButtonStyle.Link,
              label: 'Support Server',
              url: 'https://cc-haven.net/discord'
            })
          ]
        })
      ]
    });
  }
}) as SlashCommand;
