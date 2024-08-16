import { commandModule, CommandType } from '@sern/handler';
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  EmbedBuilder
} from 'discord.js';
import { ids, imgs } from '#adapters';
import { IntegrationContextType, publishConfig } from '#sern';

export default commandModule({
  type: CommandType.Slash,
  description: 'Gives basic info about a given users Descendant profile.',
  plugins: [publishConfig({ contexts: [0, 1, 2], integrationTypes: ['Guild', 'User'] })],
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: 'user-tag',
      description: 'Provide users tag as shown in game. Example: "~Peter Parker~#9732"',
      required: true
    },
    {
      type: ApplicationCommandOptionType.Boolean,
      name: 'invisible-reply',
      description: 'Should the command response be visible to others?',
      required: false
    }
  ],
  async execute(ctx, { deps }) {
    const [client, TFD] = [deps['@sern/client'], deps.nexon],
      user = ctx.options.getString('user-tag', true),
      eph = ctx.options.getBoolean('invisible-reply'),
      profile = await TFD.getUserInfo(user, 'en'),
      meta = TFD.getMetadata();

    let ephemeral: boolean;
    if (ctx.inGuild) {
      ephemeral = ctx.guild?.memberCount! > 199 ? true : eph || false;
    } else {
      ephemeral = eph ?? false;
    }

    if (!meta) {
      return await ctx.reply({
        content: 'Could not fetch data! Give it another go! If this error persists, please contact my owner!',
        ephemeral: true
      });
    } else {
      const { descendant, titles } = meta;
      if (typeof profile === 'string') {
        return await ctx.reply({
          content: profile,
          ephemeral: true
        });
      } else {
        const { basic: uB, descendant: uDes } = profile;
        let icon_url = '';
        switch (uB.platform_type) {
          case 'Steam':
            icon_url = imgs.steam;
            break;
          case 'Xbox':
            icon_url = imgs.xbox;
            break;
          default:
            icon_url = imgs.psn;
            break;
        }
        const pre = titles.find(t => t.title_id === uB.title_prefix_id)?.title_name;
        const suf = titles.find(t => t.title_id === uB.title_suffix_id)?.title_name;
        let title = '';
        if (pre && suf) {
          title += `${pre} ${suf}`;
        }
        if (uDes.descendant_id === null) {
          return await ctx.reply({
            embeds: [
              new EmbedBuilder({
                author: {
                  name: `${uB.user_name}`
                },
                color: Colors.Red,
                title,
                description: 'Descendant is currently offline or the api is not up to date!',
                fields: [
                  {
                    name: 'First played on:',
                    value: uB.platform_type
                  },
                  {
                    name: 'Mastery Rank:',
                    value: `${uB.mastery_rank_level}`
                  },
                  {
                    name: 'Spoken Language:',
                    value: uB.os_language
                  },
                  {
                    name: 'Game Language:',
                    value: uB.game_language
                  }
                ],
                footer: {
                  text: `${client.user!.username}`,
                  icon_url: client.user!.avatarURL() ?? undefined
                },
                thumbnail: { url: icon_url },
                timestamp: Date.now()
              })
            ],
            ephemeral
          });
        }
        const des = descendant.find(d => d.descendant_id === uDes.descendant_id);

        if (!des) {
          return await ctx.reply({
            content: 'Apologies, but I cannot seem to find this users descendant information.',
            ephemeral: true
          });
        } else {
          const userInfo = new EmbedBuilder({
            author: {
              name: uB.user_name,
              icon_url
            },
            color: Colors.Green,
            title: title + ` ${des.descendant_name}`,
            thumbnail: { url: des.descendant_image_url },
            fields: [
              {
                name: 'First played on:',
                value: uB.platform_type
              },
              {
                name: 'Mastery Rank:',
                value: `${uB.mastery_rank_level}`
              },
              {
                name: 'Spoken Language:',
                value: uB.os_language
              },
              {
                name: 'Game Language:',
                value: uB.game_language
              }
            ],
            footer: {
              text: `${client.user!.username}`,
              icon_url: client.user!.avatarURL() ?? undefined
            },
            timestamp: Date.now()
          });

          return await ctx.reply({
            embeds: [userInfo],
            //Will be available globally after buttons are finished!
            components:
              ctx.guildId === ids.main_guild_id && ctx.channelId === ids.channel_ids.testing
                ? [
                    new ActionRowBuilder<ButtonBuilder>({
                      components: ['Descendant', 'Weapons', 'Reactor', 'External Components', 'Complete'].map(
                        choice => {
                          return new ButtonBuilder({
                            custom_id: `ui/${choice.replace(' ', '-').toLowerCase()}`,
                            label: choice,
                            style: ButtonStyle.Primary
                          });
                        }
                      )
                    })
                  ]
                : [],
            ephemeral
          });
        }
      }
    }
  }
});
