import { PrismaClient } from '@prisma/client';
import type {
  CombinedMetaData,
  CombinedUserData,
  GlobalBaseStats,
  GlobalDescendantData,
  GlobalExternalComponentData,
  GlobalModuleData,
  GlobalReactorData,
  GlobalRewardData,
  GlobalTitles,
  GlobalVoidStatsData,
  GlobalWeaponData,
  LanguageGame,
  MetaData,
  RecommendationData,
  UID,
  UserComponent,
  UserDescendant,
  UserProfile,
  UserReactor,
  UserWeapon
} from './TFD_typings';
import { Sparky } from '#sern';

//The First Descendant
export class TFD {
  private gameUrl = 'https://open.api.nexon.com';
  private options: (options: { method: 'GET'; key: string }) => {
    method: string;
    headers: { 'accept': string; 'x-nxopen-api-key': string };
  };
  private metadata: CombinedMetaData | null = null;
  private profileCache: Map<string, { data: CombinedUserData; timeoutId: NodeJS.Timeout }> = new Map();
  private readonly CACHE_DURATION = 30 * 60 * 1000;
  constructor(private apiKey: string, private db: PrismaClient, private l: Sparky) {
    this.options = ({ method, key }) => {
      return {
        method,
        headers: {
          'accept': 'application/json',
          'x-nxopen-api-key': key
        }
      };
    };
    this.initializeMetadata()
      .then(() => this.l.success('[TFD]- Connected to OpenAPI!'))
      .catch((err: any) => {
        throw new Error(err);
      });
  }

  private get prisma() {
    return this.db.userProfile;
  }

  private async initializeMetadata() {
    this.metadata = await this.getMetaData();
  }

  private async nexonFetch(endpoint: string): Promise<Response> {
    return await fetch(`${this.gameUrl}/${endpoint}`, this.options({ method: 'GET', key: this.apiKey }));
  }

  private async shouldUpdateOuid(updatedAt: Date): Promise<boolean> {
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    const now = new Date();
    return now.getTime() - updatedAt.getTime() > THIRTY_DAYS;
  }

  public async getOuid(username: string, update = false) {
    const profileName = encodeURIComponent(username);

    const res = await this.nexonFetch(`tfd/v1/id?user_name=${profileName}`);

    if (!res.ok) {
      return 'Invalid username!';
    }

    const { ouid } = (await res.json()) as UID;

    if (update) {
      await this.prisma.upsert({
        where: { username },
        update: { ouid: ouid, updatedAt: new Date() },
        create: { username, ouid: ouid }
      });
    }

    return ouid;
  }

  public async getUserInfo(username: string, language?: LanguageGame): Promise<CombinedUserData | string> {
    const cachedProfile = this.profileCache.get(username);
    if (cachedProfile) {
      return cachedProfile.data;
    }
    let userProfile = await this.prisma.findUnique({
      where: { username: username }
    });

    let ouid = '';

    if (userProfile) {
      if (await this.shouldUpdateOuid(userProfile.updatedAt)) {
        ouid = await this.getOuid(username, true);
      } else {
        ouid = userProfile.ouid;
      }
    } else {
      ouid = await this.getOuid(username, true);
      if (ouid === 'Invalid username') {
        return ouid;
      }
    }

    const endpoints = ['basic', 'descendant', 'weapon', 'reactor', 'external-component'];
    const requests = endpoints.map(async endpoint => {
      let url = `tfd/v1/user/${endpoint}?`;
      if (language && endpoint !== 'basic' && endpoint !== 'descendant') {
        url += `language_code=${encodeURIComponent(language)}&`;
      }
      url += `ouid=${ouid}`;
      return await this.nexonFetch(url).then(res => res.json());
    });

    const [basic, descendant, weapon, reactor, externalComponent] = await Promise.all(requests);

    const combinedProfile: CombinedUserData = {
      basic: basic as UserProfile,
      descendant: descendant as UserDescendant,
      weapon: weapon as UserWeapon,
      reactor: reactor as UserReactor,
      externalComponent: externalComponent as UserComponent
    };

    const timeoutId = setTimeout(() => {
      this.clearCache(username);
    }, this.CACHE_DURATION);

    if (combinedProfile.descendant.descendant_id !== null)
      this.profileCache.set(username, { data: combinedProfile, timeoutId });

    return combinedProfile;
  }

  public clearCache(username?: string) {
    if (username) {
      const cachedProfile = this.profileCache.get(username);
      if (cachedProfile) {
        clearTimeout(cachedProfile.timeoutId);
        this.profileCache.delete(username);
      }
    } else {
      this.profileCache.forEach((value, key) => {
        clearTimeout(value.timeoutId);
      });
      this.profileCache.clear();
    }
  }

  private async getMetaData(): Promise<CombinedMetaData> {
    const endpoints: MetaData[] = [
      'descendant',
      'weapon',
      'module',
      'reactor',
      'external-component',
      'reward',
      'stat',
      'void-battle',
      'title'
    ];
    const requests = endpoints.map(async endpoint => {
      const url = `static/tfd/meta/${encodeURIComponent('en')}/${encodeURIComponent(endpoint)}.json`;
      return await this.nexonFetch(url).then(async res => {
        if (!res.ok) {
          throw new Error(`Failed to fetch metadata for ${endpoint}`);
        }
        return await res.json();
      });
    });

    const [descendant, weapon, module, reactor, externalComponent, reward, stat, voidBattle, title] = await Promise.all(
      requests
    );

    return {
      descendant: descendant as GlobalDescendantData,
      weapon: weapon as GlobalWeaponData,
      module: module as GlobalModuleData,
      reactor: reactor as GlobalReactorData,
      externalComponent: externalComponent as GlobalExternalComponentData,
      reward: reward as GlobalRewardData,
      stat: stat as GlobalBaseStats,
      voidBattle: voidBattle as GlobalVoidStatsData,
      titles: title as GlobalTitles
    };
  }

  public getMetadata(): CombinedMetaData | null {
    return this.metadata;
  }

  public async moduleRecommendation(descendantId: string, weaponId: string, voidBattleId: string, period: string) {
    const response = await this.nexonFetch(
      `tfd/v1/recommendation/module?descendant_id=${descendantId}&weapon_id=${weaponId}&void_battle_id=${voidBattleId}&period=${period}`
    );

    const data: RecommendationData = await response.json();
    return data;
  }
}
