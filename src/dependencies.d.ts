import { CoreDependencies, Singleton } from '@sern/handler';
import { Sparky } from '#sern';
import { PrismaClient } from '@prisma/client';
import { Cooldowns, TFD } from '#adapters';
import { Albion } from '#bot';

declare global {
  interface Dependencies extends CoreDependencies {
    '@sern/logger': Singleton<Sparky>;
    'prisma': Singleton<PrismaClient>;
    'cooldowns': Singleton<Cooldowns>;
    '@sern/client': Singleton<Albion>;
    'nexon': Singleton<TFD>;
  }
  interface CMDProps {
    category: string;
    examples?: string;
  }
}

export {};
