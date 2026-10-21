/**
 * Types pour le système D100 "Sol, Nouvelle Ère"
 * Conforme au Livre de règles (brouillon v0.2)
 */

export type CharacteristicKey =
  | 'for' // Force
  | 'con' // Constitution
  | 'coo' // Coordination
  | 'ref' // Réflexes
  | 'ada' // Adaptation spatiale
  | 'per' // Perception
  | 'int' // Intellect
  | 'vol' // Volonté
  | 'pre'; // Présence

export interface Characteristics {
  for: number;
  con: number;
  coo: number;
  ref: number;
  ada: number;
  per: number;
  int: number;
  vol: number;
  pre: number;
}

export type SkillDomain =
  | 'espace'
  | 'technique'
  | 'sciences'
  | 'combat'
  | 'corps'
  | 'relations'
  | 'savoirs';

export interface Skill {
  id: string;
  name: string;
  characteristic: CharacteristicKey;
  training: number; // 0 à 60
  trainingRequired?: boolean; // (F)
  untrainedAllowed?: boolean;
  domain: SkillDomain;
  specialty?: string;
}

export type HitLocation =
  | 'head'
  | 'rightArm'
  | 'leftArm'
  | 'torso'
  | 'rightLeg'
  | 'leftLeg';

export type InjurySeverity = 'legere' | 'grave' | 'critique' | 'mortelle';

export interface Injury {
  id: string;
  location: HitLocation;
  severity: InjurySeverity;
  bleeding: boolean;
  penalty: number;
  description: string;
  treated: boolean;
}

export interface ArmorZone {
  head: number;
  torso: number;
  rightArm: number;
  leftArm: number;
  rightLeg: number;
  leftLeg: number;
}

export interface Armor {
  id: string;
  name: string;
  protection: ArmorZone;
  pressurized: boolean;
  breachThreshold: number; // Ex: 4 pour combinaison souple, 8 renforcée, 12 armure de pont
  airReserveHours: number;
  sealed: boolean;
  penalty: {
    manipulation: number;
    perception: number;
  };
}

export interface Weapon {
  id: string;
  name: string;
  skillKey: string;
  damage: number; // Dégâts de base
  ammo: number;
  maxAmmo: number;
  ammoType: 'frangible' | 'perforante' | 'flechette';
  apCost: number;
  recoil: boolean; // En apesanteur, tir sans ancrage impose test Manœuvre en apesanteur
  burstAllowed: boolean;
  hullSafe: boolean; // Frangible ne perce pas la coque
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'soin' | 'outil' | 'cle' | 'munitions' | 'divers';
  quantity: number;
  description: string;
  useEffect?: string;
}

export type RadiationStatus = 'sain' | 'expose' | 'irradie' | 'condamne';

export interface Actor {
  id: string;
  name: string;
  title: string;
  faction: 'Mutuelle' | 'Veille' | 'Kombinat' | 'Indépendant';
  characteristics: Characteristics;
  origin: string;
  skills: Record<string, number>; // score total (carac + formation)
  
  // Valeurs dérivées
  sb: number; // Seuil de blessure: ceil((FOR + CON) / 20)
  toleranceG: number; // ceil(CON / 20) + mod
  endurance: number; // valeur actuelle
  maxEndurance: number; // ceil(CON / 5)
  sangFroid: number; // valeur actuelle
  maxSangFroid: number; // ceil(VOL / 5)
  
  // Radiations (mSv)
  radiationAigue: number;
  radiationCumulee: number;
  radiationStatus: RadiationStatus;

  // Équipement & combat
  armor: Armor;
  weapon: Weapon;
  injuries: Injury[];
  conditions: string[]; // 'ancré', 'flottant', 'sonné', 'saignement', 'combinaison_percee', etc.
  
  isAnchored: boolean; // Apesanteur
  inCover: boolean;
  isAlive: boolean;
}

export interface DiceRollResult {
  roll: number; // 1-100 (00 = 100)
  tens: number;
  units: number;
  score: number;
  modifiedScore: number;
  isSuccess: boolean;
  dr: number; // Degrés de réussite
  de: number; // Degrés d'échec
  isCriticalSuccess: boolean;
  isCriticalFailure: boolean;
  reversedRoll: number; // Pour localisation
  location?: HitLocation;
}

export interface AttackResult {
  hitRoll: DiceRollResult;
  targetId: string;
  attackerId: string;
  location: HitLocation;
  rawDamage: number;
  armorAbsorption: number;
  effectiveDamage: number;
  injurySeverity?: InjurySeverity;
  breachOpened: boolean;
  recoilPenaltyApplied: boolean;
  summary: string;
}

export interface EnvironmentalState {
  temperatureC: number; // Commence à -50°C
  oxygenPercent: number; // Commence à 16.5% (déclinant)
  pressureKPa: number; // Commence à 72 kPa
  turnCountdown: number; // Nombre de tours d'air/chaleur avant asphyxie/gel terminal
  heaterRepaired: boolean;
  lifeSupportHacked: boolean;
  sealStabilized: boolean;
}

export interface DialogueChoice {
  id: string;
  text: string;
  skillReq?: {
    skillId: string;
    skillName: string;
    targetScore: number;
    difficultyMod: number; // ex: 0, -10, -20
  };
  condition?: (state: any) => boolean;
  action?: (state: any) => Partial<any> | void;
  nextId: string;
}

export interface DialogueNode {
  id: string;
  speaker: string;
  speakerRole?: string;
  faction?: 'Mutuelle' | 'Veille' | 'Kombinat' | 'Système';
  text: string;
  choices: DialogueChoice[];
  isCombatTrigger?: boolean;
  isEnding?: boolean;
  endingType?: 'victory_diplomatic' | 'victory_mutuelle' | 'victory_veille' | 'victory_kombinat' | 'defeat_death' | 'defeat_hypoxia';
}
