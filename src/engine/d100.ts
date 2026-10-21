/**
 * Moteur de règles D100 pour "Sol, Nouvelle Ère"
 * Conforme au Livre de règles (brouillon v0.2, octobre 2026)
 */

import { DiceRollResult, HitLocation, InjurySeverity, Weapon } from '../types/game';

/**
 * Lance 1D100 et évalue les degrés de réussite/échec et critiques
 * selon les règles exactes du livre de règles:
 * - 01 à 05: Réussite critique automatique
 * - 96 à 100: Échec critique automatique
 * - Entre 06 et 95: un double (11, 22... 88) est critique (réussite si <= score modifié, échec sinon)
 * - DR = dizaine(score) - dizaine(dé)
 * - DE = dizaine(dé) - dizaine(score)
 */
export function rollD100(
  baseScore: number,
  modifier: number = 0,
  forcedRoll?: number
): DiceRollResult {
  const modifiedScore = Math.max(1, Math.min(100, baseScore + modifier));
  
  // 1-100 (00 équivaut à 100)
  const roll = forcedRoll !== undefined 
    ? forcedRoll 
    : Math.floor(Math.random() * 100) + 1;

  const tens = roll === 100 ? 10 : Math.floor(roll / 10);
  const units = roll === 100 ? 0 : roll % 10;
  const scoreTens = modifiedScore >= 100 ? 10 : Math.floor(modifiedScore / 10);

  const isSuccess = roll <= modifiedScore;

  // Calcul des critiques
  let isCriticalSuccess = false;
  let isCriticalFailure = false;

  const isDouble = roll >= 11 && roll <= 88 && tens === units;

  if (roll <= 5) {
    isCriticalSuccess = true;
  } else if (roll >= 96) {
    isCriticalFailure = true;
  } else if (isDouble) {
    if (isSuccess) {
      isCriticalSuccess = true;
    } else {
      isCriticalFailure = true;
    }
  }

  // Degrés de réussite / échec
  let dr = 0;
  let de = 0;
  if (isSuccess) {
    dr = Math.max(0, scoreTens - tens);
  } else {
    de = Math.max(0, tens - scoreTens);
  }

  // Inversion des chiffres pour la localisation
  const reversedRoll = reverseDigits(roll);
  const location = getLocationFromReversed(reversedRoll);

  return {
    roll,
    tens,
    units,
    score: baseScore,
    modifiedScore,
    isSuccess,
    dr,
    de,
    isCriticalSuccess,
    isCriticalFailure,
    reversedRoll,
    location,
  };
}

/**
 * Inverse les chiffres du dé pour la localisation :
 * ex : 37 -> 73, 10 -> 01, 00 (100) -> 100
 */
export function reverseDigits(roll: number): number {
  if (roll === 100) return 100;
  const tens = Math.floor(roll / 10);
  const units = roll % 10;
  const reversed = units * 10 + tens;
  return reversed === 0 ? 100 : reversed;
}

/**
 * Table de localisation officielle :
 * 01 à 10 : Tête
 * 11 à 25 : Bras droit
 * 26 à 40 : Bras gauche
 * 41 à 70 : Torse
 * 71 à 85 : Jambe droite
 * 86 à 100 : Jambe gauche
 */
export function getLocationFromReversed(reversed: number): HitLocation {
  if (reversed >= 1 && reversed <= 10) return 'head';
  if (reversed >= 11 && reversed <= 25) return 'rightArm';
  if (reversed >= 26 && reversed <= 40) return 'leftArm';
  if (reversed >= 41 && reversed <= 70) return 'torso';
  if (reversed >= 71 && reversed <= 85) return 'rightLeg';
  return 'leftLeg';
}

export function getLocationLabelFr(loc: HitLocation): string {
  switch (loc) {
    case 'head': return 'Tête / Visière';
    case 'torso': return 'Torse (organes vitaux)';
    case 'rightArm': return 'Bras droit';
    case 'leftArm': return 'Bras gauche';
    case 'rightLeg': return 'Jambe droite';
    case 'leftLeg': return 'Jambe gauche';
  }
}

/**
 * Calcul des dégâts et gravité de blessure selon le Seuil de Blessure (SB):
 * - Inférieurs au SB : blessure légère (-10)
 * - De SB à 2 SB − 1 : blessure grave (-20, saignement -1 End/tour)
 * - De 2 SB à 3 SB − 1 : blessure critique (hors d'usage, risque d'inconscience)
 * - À partir de 3 SB : blessure mortelle
 */
export function evaluateInjury(
  effectiveDamage: number,
  sb: number
): { severity: InjurySeverity; penalty: number; bleeding: boolean } | null {
  if (effectiveDamage <= 0) return null;

  if (effectiveDamage < sb) {
    return {
      severity: 'legere',
      penalty: -10,
      bleeding: false,
    };
  } else if (effectiveDamage < 2 * sb) {
    return {
      severity: 'grave',
      penalty: -20,
      bleeding: true,
    };
  } else if (effectiveDamage < 3 * sb) {
    return {
      severity: 'critique',
      penalty: -30,
      bleeding: true,
    };
  } else {
    return {
      severity: 'mortelle',
      penalty: -50,
      bleeding: true,
    };
  }
}

/**
 * Calcul des valeurs dérivées
 */
export function calculateDerivedStats(forScore: number, conScore: number, volScore: number) {
  return {
    sb: Math.ceil((forScore + conScore) / 20),
    toleranceG: Math.ceil(conScore / 20),
    endurance: Math.ceil(conScore / 5),
    sangFroid: Math.ceil(volScore / 5),
  };
}
