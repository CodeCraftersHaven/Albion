import { type CoreDependencies } from '@sern/handler';
import { Sparky } from '#sern';
import { PrismaClient } from '@prisma/client';
import { Cooldowns, TFD } from '#adapters';
import { Albion } from '#bot';

declare global {
  interface Dependencies extends CoreDependencies {
    '@sern/logger': Sparky;
    'prisma': PrismaClient;
    'cooldowns': Cooldowns;
    '@sern/client': Albion;
    'nexon': TFD;
  }
  interface CMDProps {
    category: string;
    examples?: string;
  }
}

export {};
