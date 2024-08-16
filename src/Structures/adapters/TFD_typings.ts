// User ID
export interface UID {
  ouid: string;
}

// Basic Info
export interface UserProfile {
  ouid: string;
  user_name: string; // Format: Nickname#1234
  platform_type: string;
  mastery_rank_level: number;
  mastery_rank_exp: number;
  title_prefix_id: string;
  title_suffix_id: string;
  os_language: LanguageOS;
  game_language: LanguageGame;
}

// Descendant
interface DescendantModule {
  module_slot_id: string;
  module_id: string;
  module_enchant_level: number;
}

export interface UserDescendant {
  ouid: string;
  user_name: string; // Format: Nickname#1234
  descendant_id: string;
  descendant_slot_id: string;
  descendant_level: number;
  module_max_capacity: number;
  module_capacity: number;
  module: DescendantModule[];
}

// Weapon
interface AdditionalStat {
  additional_stat_name: string;
  additional_stat_value: string;
}

interface WeaponModule {
  module_slot_id: string;
  module_id: string;
  module_enchant_level: number;
}

interface Weapon {
  module_max_capacity: number;
  module_capacity: number;
  weapon_slot_id: string;
  weapon_id: string;
  weapon_level: number;
  perk_ability_enchant_level: number;
  weapon_additional_stat: AdditionalStat[];
  module: WeaponModule[];
}

export interface UserWeapon {
  ouid: string;
  user_name: string; // Format: Nickname#1234
  weapon: Weapon[];
}

// Reactor
interface ReactorAdditionalStat {
  additional_stat_name: string;
  additional_stat_value: string;
}

export interface UserReactor {
  ouid: string;
  user_name: string; // Format: Nickname#1234
  reactor_id: string;
  reactor_slot_id: string;
  reactor_level: number;
  reactor_additional_stat: ReactorAdditionalStat[];
  reactor_enchant_level: number;
}

// External Component
interface ExternalComponentAdditionalStat {
  additional_stat_name: string;
  additional_stat_value: string;
}

interface ExternalComponent {
  external_component_slot_id: string;
  external_component_id: string;
  external_component_level: number;
  external_component_additional_stat: ExternalComponentAdditionalStat[];
}

export interface UserComponent {
  ouid: string;
  user_name: string; // Format: Nickname#1234
  external_component: ExternalComponent[];
}

export type LanguageOS =
  | 'Korean'
  | 'English'
  | 'German'
  | 'French'
  | 'Japanese'
  | 'Chinese Simplified'
  | 'Chinese Traditional'
  | 'Italian'
  | 'Polish'
  | 'Portuguese'
  | 'Russian'
  | 'Spanish';
export type LanguageGame = 'ko' | 'en' | 'de' | 'fr' | 'ja' | 'zh-CN' | 'zh-TW' | 'it' | 'pl' | 'pt' | 'ru' | 'es';
interface Language {
  name: LanguageOS;
  value: LanguageGame;
}
export const languages: Language[] = [
  { name: 'Korean', value: 'ko' },
  { name: 'English', value: 'en' },
  { name: 'German', value: 'de' },
  { name: 'French', value: 'fr' },
  { name: 'Japanese', value: 'ja' },
  { name: 'Chinese Simplified', value: 'zh-CN' },
  { name: 'Chinese Traditional', value: 'zh-TW' },
  { name: 'Italian', value: 'it' },
  { name: 'Polish', value: 'pl' },
  { name: 'Portuguese', value: 'pt' },
  { name: 'Russian', value: 'ru' },
  { name: 'Spanish', value: 'es' }
];
export type Endpoint = 'basic' | 'descendant' | 'weapon' | 'reactor' | 'external-component';
export type MetaData =
  | 'descendant'
  | 'weapon'
  | 'module'
  | 'reactor'
  | 'external-component'
  | 'reward'
  | 'stat'
  | 'void-battle'
  | 'title';
//Weapons Data
interface BaseStat {
  stat_id: string;
  stat_value: number;
}

interface FirearmAtk {
  firearm_atk_type: string;
  firearm_atk_value: number;
}

interface Weapon {
  weapon_name: string;
  weapon_id: string;
  image_url: string;
  weapon_type: string;
  weapon_tier: string;
  weapon_rounds_type: string;
  base_stat: BaseStat[];
  firearm_atk: {
    level: number;
    firearm: FirearmAtk[];
  }[];
  weapon_perk_ability_name: string;
  weapon_perk_ability_description: string;
}

export type GlobalWeaponData = Weapon[];

//Global Descendant Data
type StatDetail = {
  stat_type: string;
  stat_value: number;
}[]

interface DescendantSkill {
  skill_type: string;
  skill_name: string;
  element_type: string;
  arche_type: string;
  skill_image_url: string;
  skill_description: string;
}

interface Descendant {
  descendant_id: string;
  descendant_name: string;
  descendant_image_url: string;
  descendant_stat: {
    level: number;
    stat_detail: StatDetail;
  }[];
  descendant_skill: DescendantSkill[];
}

export type GlobalDescendantData = Descendant[];

//Global Module Data
interface ModuleStat {
  level: number;
  module_capacity: number;
  value: string;
}

interface Module {
  module_name: string;
  module_id: string;
  image_url: string;
  module_type: string;
  module_tier: string;
  module_socket_type: string;
  module_class: string;
  module_stat: ModuleStat[];
}

export type GlobalModuleData = Module[];

//Global Reactor Data
interface CoefficientStat {
  coefficient_stat_id: string;
  coefficient_stat_value: number;
}

interface EnchantEffect {
  enchant_level: number;
  stat_type: string;
  value: number;
}

interface ReactorSkillPower {
  level: number;
  skill_atk_power: number;
  sub_skill_atk_power: number;
  skill_power_coefficient: CoefficientStat[];
  enchant_effect: EnchantEffect[];
}

interface Reactor {
  reactor_id: string;
  reactor_name: string;
  image_url: string;
  reactor_tier: string;
  reactor_skill_power: ReactorSkillPower[];
  optimized_condition_type: string;
}

export type GlobalReactorData = Reactor[];

//Global External Component Data
interface BaseStat {
  level: number;
  stat_id: string;
  stat_value: number;
}

interface SetOptionDetail {
  set_option: string;
  set_count: number;
  set_option_effect: string;
}

interface ExternalComponent {
  external_component_id: string;
  external_component_name: string;
  image_url: string;
  external_component_equipment_type: string;
  external_component_tier: string;
  base_stat: BaseStat[];
  set_option_detail: SetOptionDetail[];
}

export type GlobalExternalComponentData = ExternalComponent[];

//Global Reward Data
interface Reward {
  rotation: number;
  reward_type: string;
  reactor_element_type: string;
  weapon_rounds_type: string;
  arche_type: string;
}

interface BattleZone {
  battle_zone_id: string;
  battle_zone_name: string;
  reward: Reward[];
}

interface MapReward {
  map_id: string;
  map_name: string;
  battle_zone: BattleZone[];
}

export type GlobalRewardData = MapReward[];

//Global Base Stat Data
export type GlobalBaseStats = {
  stat_id: string;
  stat_name: string;
}[];

//Global Void Intercept Battle Data
export type GlobalVoidStatsData = {
  void_battle_id: string;
  void_battle_name: string;
}[];

//Global Titles Data
interface GlobalTitle {
  title_id: string;
  title_name: string;
}

export type GlobalTitles = GlobalTitle[];

export interface CombinedUserData {
  basic: UserProfile;
  descendant: UserDescendant;
  weapon: UserWeapon;
  reactor: UserReactor;
  externalComponent: UserComponent;
}

export interface CombinedMetaData {
  descendant: GlobalDescendantData;
  weapon: GlobalWeaponData;
  module: GlobalModuleData;
  reactor: GlobalReactorData;
  externalComponent: GlobalExternalComponentData;
  reward: GlobalRewardData;
  stat: GlobalBaseStats;
  voidBattle: GlobalVoidStatsData;
  titles: GlobalTitles;
}

//recommendations
export type RecommendationData = {
  descendant: {
    descendant_id: string;
    recommendation: {
      module_id: string;
    }[];
  };
  weapon: {
    weapon_id: string;
    recommendation: {
      module_id: string;
    }[];
  };
};

//extras
export const imgs = {
  steam: 'https://cdn.freebiesupply.com/images/large/2x/steam-logo-black-transparent.png',
  xbox: 'https://www.freeiconspng.com/uploads/xbox-icon-2.png',
  psn: 'https://cdn.freebiesupply.com/logos/large/2x/playstation-3-logo-black-and-white.png'
};

//ui buttons data
export interface DescendantData {
  descendant_id: string;
  descendant_name: string;
  descendant_image_url: string;
  descendant_stat: {
    level: number;
    stat_detail: StatDetail;
  } | null;
  descendant_skill: {
    skill_type: string;
    skill_name: string;
    element_type: string;
    arche_type: string;
    skill_image_url: string;
    skill_description: string;
  }[];
  descendant_modules: {
    capacity: string;
    equipped_modules: {
      slot: string;
      id: string;
      name: string;
    }[];
  };
};

export interface WeaponData {
  weapon_id: string,
  weapon_name: string,
  weapon_image_url: string,
  weapon_type: string,
  weapon_rounds_type: string,
  weapon_tier: string,
  weapon_level: number,
  weapon_firearm_atk: number
}

export interface ReactorData {
  reactor_id: string,
              reactor_name: string,
              reactor_image_url: string,
              reactor_stats: {
                level: number,
                skill_atk_power: number,
                sub_skill_atk_power: number,
                enchant_effect: EnchantEffect[],
                skill_power_coefficient: CoefficientStat[]
              }
}