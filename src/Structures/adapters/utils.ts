import {
  AttachmentBuilder,
  AuditLogEvent,
  Colors,
  EmbedBuilder,
  EmbedField,
  Guild,
  PermissionResolvable,
  PermissionsBitField,
  User
} from 'discord.js';
import path from 'path';
import fs from 'fs/promises';
import { env } from '#sern';

export type AssetEncoding = 'attachment' | 'base64' | 'binary' | 'utf8' | 'json';
type PartialAssetEncoding = Exclude<AssetEncoding, 'attachment' | 'json'>;
const ASSETS_DIR = path.resolve('assets');

/**
 * Reads an asset file from the 'assets' directory.
 * If encoding is 'attachment', a discord.js AttachmentBuilder is provided, else
 * fs.promises.readFile is called. The default encoding is utf8.
 */
export async function Asset(opts: { p: string; name?: never; encoding?: PartialAssetEncoding }): Promise<string>;
export async function Asset<T>(opts: { p: string; name?: never; encoding: 'json' }): Promise<T>;
export async function Asset(opts: { p: string; name?: string; encoding: 'attachment' }): Promise<AttachmentBuilder>;
export async function Asset(opts: {
  p: string;
  name?: string;
  encoding?: AssetEncoding;
}): Promise<string | AttachmentBuilder> {
  const { p, encoding = 'utf8' } = opts;

  let relativePath: string;
  if (path.isAbsolute(p)) {
    relativePath = path.relative(ASSETS_DIR, 'assets' + p);
  } else {
    relativePath = p;
  }

  const filePath = path.join(ASSETS_DIR, relativePath);

  if (encoding === 'attachment') {
    const attachmentName = opts?.name || path.basename(filePath);
    return new AttachmentBuilder(filePath, { name: attachmentName });
  } else if (encoding === 'json') {
    return fs.readFile(filePath, 'utf8').then(JSON.parse);
  } else {
    return fs.readFile(filePath, encoding);
  }
}

export const owners = env.OWNER_IDS[0].replaceAll(/[\[\]"]/g, '').split(', ');

export const permsToString = (...perms: PermissionResolvable[]) => {
  return new PermissionsBitField(perms)
    .toArray()
    .map((perm) => `\`${perm}\``)
    .join(', ');
};

/******************TYPES********************/
export interface InternalCooldownConfig {
  cooldownType: CooldownTypes;
  duration: number | [number, 's' | 'm' | 'd' | 'h'];
  userId: string;
  actionId: string;
  guildId?: string;
  channelId?: string;
}

export enum CooldownTypes {
  perUser = 'perUser',
  perUserPerGuild = 'perUserPerGuild',
  perGuild = 'perGuild',
  global = 'global',
  perChannel = 'perChannel',
  perUserPerChannel = 'perUserPerChannel'
}

export const cooldownDurations = {
  s: 1,
  m: 60,
  h: 60 * 60,
  d: 60 * 60 * 24
};
/*******************************************/

export const displayData = (opts: {
  user: User;
  title: string;
  description?: string;
  fields?: EmbedField[];
  image?: string;
  thumbnail?: string;
}) => {
  const { title, user, description, fields, image, thumbnail } = opts;
  return new EmbedBuilder({
    author: {
      name: 'Albion Guide',
      icon_url: 'https://cdn.discordapp.com/avatars/1263202205851193447/6f3d502651a0eeb1825ee59d5741ccee?size=128'
    },
    title,
    description: description ?? '',
    fields: fields ?? [],
    footer: {
      text: `Requested by: ${user.displayName}`,
      icon_url: user.avatarURL() ?? ''
    },
    timestamp: Date.now(),
    color: Colors.Blurple,
    image: {
      url: image ?? ''
    },
    thumbnail: {
      url: thumbnail ?? ''
    }
  });
};

export const joinEmbed = async (guild: Guild) => {
  const owner = await guild.fetchOwner();
  const entry = (await guild.fetchAuditLogs()).entries.filter((e) => e.action === AuditLogEvent.BotAdd).find((e) => e.targetId === '1263202205851193447');
  return new EmbedBuilder({
    author: {
      name: entry?.executor?.username!,
      icon_url: entry?.executor?.displayAvatarURL() ?? ''
    },
    color: Colors.Blurple,
    image: {url: guild.banner ? guild.bannerURL()! : ''},
    timestamp: entry?.createdAt!,
    description: 'I have been added to a new guild!',
    fields: [
      {
        name: 'Guild',
        value: `\`${guild.name} (${guild.id})\``
      },
      {
        name: 'Guild Owner',
        value: `[${owner.user.username}](<https://discord.com/users/${owner.id}>) \`(${owner.id})\``
      },
      {
        name: 'Inviter',
        value: `[${entry?.executor?.username}](<https://discord.com/users/${entry?.executorId}>) \`(${entry?.executorId})\``
      }
    ]
  })
}

export const leaveEmbed = async (guild: Guild) => {
  return new EmbedBuilder({
    color: Colors.Red,
    timestamp: Date.now(),
    description: 'I have been removed from a guild!',
    fields: [
      {
        name: 'Guild',
        value: `\`${guild.name} (${guild.id})\``
      },
    ]
  })
}