/**
 * Système de Combat Tactique au Tour par Tour "Sol, Nouvelle Ère"
 * Conforme au Livre de règles v0.2 :
 * - Tours de ~5 secondes
 * - Points d'Action (PA)
 * - Jet D100 avec inversion pour la localisation
 * - Recul newtonien en microgravité (0.04g)
 * - Couvert et tirs visés
 * - Seuil de blessure (SB) et brèches de combinaison
 */

import React, { useState } from 'react';
import { Actor, HitLocation, InventoryItem } from '../types/game';
import { rollD100, evaluateInjury, getLocationLabelFr } from '../engine/d100';
import { soundFx } from '../engine/audio';
import { DiceRollDisplay } from './DiceRollDisplay';

interface TacticalCombatProps {
  player: Actor;
  npcs: Record<string, Actor>;
  onUpdatePlayer: (updater: (prev: Actor) => Actor) => void;
  onUpdateNpc: (npcId: string, updater: (prev: Actor) => Actor) => void;
  onAdvanceTurn: () => void;
  onVictory: (endingId: string) => void;
  onDefeat: (endingId: string) => void;
  inventory: InventoryItem[];
  onConsumeItem: (itemId: string) => void;
}

export const TacticalCombat: React.FC<TacticalCombatProps> = ({
  player,
  npcs,
  onUpdatePlayer,
  onUpdateNpc,
  onAdvanceTurn,
  onVictory,
  onDefeat,
  inventory,
  onConsumeItem,
}) => {
  const [ap, setAp] = useState<number>(8); // 8 PA par tour
  const [selectedTarget, setSelectedTarget] = useState<string>('voronov');
  const [combatLog, setCombatLog] = useState<string[]>([
    'COMBAT ENGAGÉ : Microgravité 0.04g. Température critique. Chaque tir compte.',
    'Protégez Lina et le conteneur cryogénique !',
  ]);
  const [lastRoll, setLastRoll] = useState<any>(null);
  const [aimLocation, setAimLocation] = useState<HitLocation | 'standard'>('standard');

  const patchItem = inventory.find((i) => i.id === 'rustine' && i.quantity > 0);
  const medkitItem = inventory.find((i) => i.id === 'medkit' && i.quantity > 0);

  const targetNpc = npcs[selectedTarget];

  const logMessage = (msg: string) => {
    setCombatLog((prev) => [msg, ...prev.slice(0, 19)]);
  };

  /**
   * Action : Tirer sur la cible sélectionnée
   */
  const handleShoot = (isAimed: boolean, targetLoc?: HitLocation) => {
    const apCost = isAimed ? (targetLoc === 'head' ? 6 : 5) : 4;
    if (ap < apCost) {
      logMessage(`[PA INSUFFISANTS] Vous avez besoin de ${apCost} PA pour ce tir.`);
      soundFx.playCriticalFailure();
      return;
    }

    if (player.weapon.ammo <= 0) {
      logMessage(`[CLIC À SEC] Le chargeur de votre ${player.weapon.name} est vide !`);
      soundFx.playCriticalFailure();
      return;
    }

    // Consommation munitions et PA
    setAp((prev) => prev - apCost);
    onUpdatePlayer((p) => ({
      ...p,
      weapon: { ...p.weapon, ammo: p.weapon.ammo - 1 },
    }));

    soundFx.playGunshot();

    // Calcul du modificateur
    let modifier = 0;
    if (targetNpc?.inCover) modifier -= 20;

    if (isAimed && targetLoc) {
      if (targetLoc === 'head') modifier -= 30;
      else if (targetLoc === 'torso') modifier -= 10;
      else modifier -= 20; // bras ou jambe
    }

    // Jet de tir
    const baseScore = player.skills['armes_poing'] || 55;
    const rollRes = rollD100(baseScore, modifier);
    setLastRoll(rollRes);

    if (rollRes.isSuccess) {
      soundFx.playDiceRoll();
      const location = isAimed && targetLoc ? targetLoc : rollRes.location || 'torso';
      const locLabel = getLocationLabelFr(location);

      // Calcul des dégâts : Dégâts fixe + DR - Armure de la zone
      const armorVal = targetNpc.armor.protection[location] || 0;
      const rawDamage = player.weapon.damage + rollRes.dr;
      const effectiveDamage = Math.max(0, rawDamage - armorVal);

      // Évaluation de la blessure selon le SB de la cible
      const injury = evaluateInjury(effectiveDamage, targetNpc.sb);

      logMessage(
        `[TOUCHÉ !] Tir sur ${targetNpc.name} à la ${locLabel} : jet ${rollRes.roll} (DR ${rollRes.dr}). Dégâts bruts ${rawDamage} - Armure ${armorVal} = ${effectiveDamage} effectifs.`
      );

      // Vérification de brèche de combinaison
      const breachOpened = targetNpc.armor.pressurized && rawDamage > targetNpc.armor.breachThreshold;
      if (breachOpened) {
        logMessage(`⚠ BRÈCHE OUVERTE : La combinaison de ${targetNpc.name} est perforée ! Décompression amorcée.`);
      }

      // Mise à jour du PNJ
      onUpdateNpc(selectedTarget, (npc) => {
        const newEndurance = Math.max(0, npc.endurance - effectiveDamage);
        const newConditions = [...npc.conditions];

        if (breachOpened && !newConditions.includes('combinaison_percee')) {
          newConditions.push('combinaison_percee');
        }
        if (injury?.bleeding && !newConditions.includes('saignement')) {
          newConditions.push('saignement');
        }

        const isAlive = newEndurance > 0;
        if (!isAlive) {
          logMessage(`[NEUTRALISÉ] ${npc.name} s'effondre en apesanteur, hors de combat !`);
        }

        return {
          ...npc,
          endurance: newEndurance,
          conditions: newConditions,
          isAlive,
        };
      });
    } else {
      soundFx.playCriticalFailure();
      logMessage(`[MANQUÉ] Votre tir frangible ricoche contre les cloisons (jet ${rollRes.roll} > score modifié).`);
    }

    // Gestion du recul en apesanteur
    if (!player.isAnchored) {
      logMessage(`[RECUL NEWTONIEN] Non ancré, la propulsion du tir vous fait dériver en microgravité !`);
      onUpdatePlayer((p) => ({
        ...p,
        conditions: Array.from(new Set([...p.conditions, 'flottant'])),
      }));
    }

    // Vérifier si tous les ennemis sont neutralisés
    checkCombatEnd();
  };

  /**
   * Action : S'ancrer aux barres magnétiques (2 PA)
   */
  const handleAnchor = () => {
    if (ap < 2) {
      logMessage('[PA INSUFFISANTS] 2 PA requis pour s\'ancrer.');
      return;
    }
    setAp((prev) => prev - 2);
    soundFx.playConfirm();
    onUpdatePlayer((p) => ({
      ...p,
      isAnchored: !p.isAnchored,
      conditions: p.isAnchored
        ? p.conditions.filter((c) => c !== 'ancré')
        : Array.from(new Set([...p.conditions.filter((c) => c !== 'flottant'), 'ancré'])),
    }));
    logMessage(player.isAnchored ? 'Vous détachez vos fixations magnétiques.' : 'Vous verrouillez vos bottes magnétiques aux caillebotis (Immunisé au recul).');
  };

  /**
   * Action : Se mettre à couvert (3 PA)
   */
  const handleCover = () => {
    if (ap < 3) {
      logMessage('[PA INSUFFISANTS] 3 PA requis pour se mettre à couvert.');
      return;
    }
    setAp((prev) => prev - 3);
    soundFx.playConfirm();
    onUpdatePlayer((p) => ({
      ...p,
      inCover: !p.inCover,
    }));
    logMessage(player.inCover ? 'Vous quittez votre abri.' : 'Vous vous glissez derrière le montant blindé du sas (-20 pour vous toucher).');
  };

  /**
   * Action : Rustine d'urgence (3 PA)
   */
  const handleUsePatch = () => {
    if (!patchItem) return;
    if (ap < 3) {
      logMessage('[PA INSUFFISANTS] 3 PA requis.');
      return;
    }
    setAp((prev) => prev - 3);
    onConsumeItem('rustine');
    soundFx.playPneumaticHiss();
    onUpdatePlayer((p) => ({
      ...p,
      conditions: p.conditions.filter((c) => c !== 'combinaison_percee'),
      armor: { ...p.armor, sealed: true },
    }));
    logMessage('[COLMATAGE RÉUSSI] Vous claquez une rustine polymère sur votre combinaison. Pression rétablie !');
  };

  /**
   * Action : Medkit (4 PA)
   */
  const handleUseMedkit = () => {
    if (!medkitItem) return;
    if (ap < 4) {
      logMessage('[PA INSUFFISANTS] 4 PA requis.');
      return;
    }
    setAp((prev) => prev - 4);
    onConsumeItem('medkit');
    soundFx.playPneumaticHiss();
    onUpdatePlayer((p) => ({
      ...p,
      endurance: Math.min(p.maxEndurance, p.endurance + 3),
      conditions: p.conditions.filter((c) => c !== 'saignement'),
    }));
    logMessage('[SOINS D\'URGENCE] Injecteur hémostatique appliqué : +3 Endurance, saignement stoppé !');
  };

  /**
   * Action : Intimidation en plein combat (3 PA)
   */
  const handleIntimidateInCombat = () => {
    if (ap < 3) return;
    setAp((prev) => prev - 3);

    const roll = rollD100(player.skills['intimidation'] || 55, 0);
    setLastRoll(roll);

    if (roll.isSuccess) {
      soundFx.playCriticalSuccess();
      logMessage(`[INTIMIDATION RÉUSSIE] Votre voix de baryton claque dans l'intercom : Voronov ou Kael hésite et baisse son arme !`);
      if (selectedTarget === 'voronov') {
        onUpdateNpc('voronov', (v) => ({ ...v, inCover: false, sangFroid: Math.max(0, v.sangFroid - 3) }));
      }
    } else {
      soundFx.playCriticalFailure();
      logMessage(`[INTIMIDATION RATÉE] Vos ennemis refusent d'obtempérer sous le feu !`);
    }
  };

  /**
   * Passer le tour : Déclenche le tour des PNJ et fait avancer le compte à rebours
   */
  const handleEndTurn = () => {
    soundFx.playConfirm();
    logMessage('--- FIN DE VOTRE TOUR (5 SECONDES ÉCOULÉES) ---');

    // Réinitialisation PA joueur
    setAp(8);

    // Dégâts de saignement joueur si blessé
    if (player.conditions.includes('saignement')) {
      onUpdatePlayer((p) => {
        const nextEnd = Math.max(0, p.endurance - 1);
        logMessage(`⚠ HÉMORRAGIE : Vous perdez 1 point d'Endurance à cause du saignement (${nextEnd}/${p.maxEndurance}).`);
        if (nextEnd <= 0) {
          onDefeat('fin_defaite_hypoxie');
        }
        return { ...p, endurance: nextEnd };
      });
    }

    // Tour de Voronov (s'il est vivant)
    if (npcs.voronov.isAlive) {
      executeNpcTurn('voronov');
    }

    // Tour de Kael (s'il est vivant)
    if (npcs.kael.isAlive) {
      executeNpcTurn('kael');
    }

    // Avancer l'environnement
    onAdvanceTurn();

    // Vérifier issue
    checkCombatEnd();
  };

  /**
   * IA simplifiée des PNJ
   */
  const executeNpcTurn = (npcId: string) => {
    const npc = npcs[npcId];
    if (!npc || !npc.isAlive) return;

    soundFx.playGunshot();

    // Cible : Voronov tire sur le joueur ou Kael
    const targetIsPlayer = npcId === 'voronov' ? Math.random() > 0.3 : false;

    if (targetIsPlayer) {
      const modifier = player.inCover ? -20 : 0;
      const roll = rollD100(npc.skills['armes_poing'] || 55, modifier);

      if (roll.isSuccess) {
        const loc = roll.location || 'torso';
        const locLabel = getLocationLabelFr(loc);
        const armorVal = player.armor.protection[loc] || 0;
        const rawDamage = npc.weapon.damage + roll.dr;
        const effectiveDamage = Math.max(0, rawDamage - armorVal);

        logMessage(
          `[TIR ENNEMI] ${npc.name} vous tire dessus et touche votre ${locLabel} ! (${effectiveDamage} dégâts subis).`
        );

        onUpdatePlayer((p) => {
          const nextEnd = Math.max(0, p.endurance - effectiveDamage);
          const newConds = [...p.conditions];
          if (effectiveDamage >= p.sb && !newConds.includes('saignement')) {
            newConds.push('saignement');
          }
          if (rawDamage > p.armor.breachThreshold && !newConds.includes('combinaison_percee')) {
            newConds.push('combinaison_percee');
            logMessage('⚠ VOTRE COMBINAISON EST PERCÉE ! Utilisez une rustine.');
          }

          if (nextEnd <= 0) {
            onDefeat('fin_defaite_hypoxie');
          }

          return { ...p, endurance: nextEnd, conditions: newConds };
        });
      } else {
        logMessage(`[TIR ENNEMI ÉVITÉ] Le tir de ${npc.name} siffle à côté de votre casque.`);
      }
    } else {
      // Voronov et Kael s'entre-déchirent
      const otherId = npcId === 'voronov' ? 'kael' : 'voronov';
      const otherNpc = npcs[otherId];
      if (otherNpc && otherNpc.isAlive) {
        logMessage(`[ÉCHANGE DE COUPS] ${npc.name} tire sur ${otherNpc.name} !`);
        onUpdateNpc(otherId, (o) => ({
          ...o,
          endurance: Math.max(0, o.endurance - 4),
        }));
      }
    }
  };

  const checkCombatEnd = () => {
    // Si Voronov est mort et Kael vivant -> proposition de paix
    if (!npcs.voronov.isAlive && npcs.kael.isAlive) {
      logMessage('[VICTOIRE TACTIQUE] Voronov est neutralisé ! L\'inspecteur Kael baisse son arme.');
      setTimeout(() => {
        onVictory('fin_victoire_diplomatique');
      }, 1500);
    } else if (!npcs.voronov.isAlive && !npcs.kael.isAlive) {
      logMessage('[COMBAT TERMINÉ] Vous êtes le seul debout dans le sas givré.');
      setTimeout(() => {
        onVictory('fin_mutuelle_independante');
      }, 1500);
    }
  };

  return (
    <div className="flex flex-col h-full font-mono text-xs select-none">
      {/* Radar Tactique du Sas Thulé-7 */}
      <div className="p-3 border-b-2 border-current bg-black/90 flex flex-col gap-2">
        <div className="flex items-center justify-between text-[11px] border-b border-current/30 pb-1">
          <span className="font-bold flex items-center gap-1.5 uppercase">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            RADAR TACTIQUE DU SAS // MICROGRAVITÉ (0.04 G)
          </span>
          <div className="flex items-center gap-2">
            <span>PA RESTANTS :</span>
            <div className="flex gap-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <span
                  key={i}
                  className={`w-3.5 h-3.5 border border-current rounded-xs flex items-center justify-center font-bold text-[9px] ${
                    i < ap ? 'bg-current text-black' : 'opacity-20'
                  }`}
                >
                  •
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Représentation visuelle des 4 combattants dans le sas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {/* Joueur */}
          <div
            className={`p-2 border rounded transition-all ${
              player.inCover ? 'border-current bg-current/15' : 'border-current/50 bg-black'
            }`}
          >
            <div className="font-bold text-[11px] flex items-center justify-between text-emerald-400">
              <span>VOUS (Vaelen)</span>
              <span className="text-[10px]">{player.isAnchored ? 'ANCRÉ' : 'FLOTTANT'}</span>
            </div>
            <div className="text-[10px] opacity-80 mt-1">
              Endurance: <span className="font-bold">{player.endurance}/{player.maxEndurance}</span>
            </div>
            <div className="text-[10px] opacity-80">
              Munitions: {player.weapon.ammo}/{player.weapon.maxAmmo}
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {player.inCover && <span className="text-[9px] px-1 border border-current">À COUVERT</span>}
              {player.conditions.map((c) => (
                <span key={c} className="text-[9px] px-1 bg-current/20 uppercase rounded">
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Lina */}
          <div className="p-2 border border-current/30 bg-black rounded opacity-90">
            <div className="font-bold text-[11px] text-yellow-400 flex items-center justify-between">
              <span>LINA (Alliée)</span>
              <span className="text-[9px]">{npcs.lina.isAlive ? 'PROTÉGÉE' : 'K.O.'}</span>
            </div>
            <div className="text-[10px] opacity-80 mt-1">
              Endurance: <span className="font-bold">{npcs.lina.endurance}/{npcs.lina.maxEndurance}</span>
            </div>
            <div className="text-[9px] text-rose-400 mt-1">
              {npcs.lina.conditions.join(', ') || 'Stable'}
            </div>
            <div className="text-[9px] opacity-60 mt-0.5">Tient le conteneur cryo</div>
          </div>

          {/* Kael */}
          <div
            onClick={() => npcs.kael.isAlive && setSelectedTarget('kael')}
            className={`p-2 border rounded cursor-pointer transition-all ${
              selectedTarget === 'kael'
                ? 'border-emerald-400 bg-emerald-950/30 ring-1 ring-emerald-400'
                : 'border-current/40 bg-black'
            } ${!npcs.kael.isAlive && 'opacity-40 pointer-events-none'}`}
          >
            <div className="font-bold text-[11px] text-cyan-400 flex items-center justify-between">
              <span>INSP. KAEL</span>
              <span className="text-[9px]">{npcs.kael.isAlive ? 'ARMÉ' : 'HORS SERVICE'}</span>
            </div>
            <div className="text-[10px] opacity-80 mt-1">
              Endurance: <span className="font-bold">{npcs.kael.endurance}/{npcs.kael.maxEndurance}</span>
            </div>
            <div className="text-[9px] opacity-70">Armure Veille (4/4/3/3)</div>
            {selectedTarget === 'kael' && (
              <div className="text-[9px] text-emerald-400 font-bold mt-1 uppercase">▶ CIBLE ACTIVE</div>
            )}
          </div>

          {/* Voronov */}
          <div
            onClick={() => npcs.voronov.isAlive && setSelectedTarget('voronov')}
            className={`p-2 border rounded cursor-pointer transition-all ${
              selectedTarget === 'voronov'
                ? 'border-rose-400 bg-rose-950/40 ring-1 ring-rose-400'
                : 'border-current/40 bg-black'
            } ${!npcs.voronov.isAlive && 'opacity-40 pointer-events-none'}`}
          >
            <div className="font-bold text-[11px] text-rose-400 flex items-center justify-between">
              <span>VORONOV (Hélion)</span>
              <span className="text-[9px]">{npcs.voronov.isAlive ? 'HOSTILE' : 'NEUTRALISÉ'}</span>
            </div>
            <div className="text-[10px] opacity-80 mt-1">
              Endurance: <span className="font-bold">{npcs.voronov.endurance}/{npcs.voronov.maxEndurance}</span>
            </div>
            <div className="text-[9px] opacity-70">Combi Titan (2/3/2/2)</div>
            {selectedTarget === 'voronov' && (
              <div className="text-[9px] text-rose-400 font-bold mt-1 uppercase">▶ CIBLE ACTIVE</div>
            )}
          </div>
        </div>
      </div>

      {/* Lancer de dé affiché */}
      <div className="px-3">
        <DiceRollDisplay result={lastRoll} label="Résultat de l'action de combat" isCombatRoll={true} />
      </div>

      {/* Journal de combat défilant */}
      <div className="flex-1 p-3 overflow-y-auto space-y-1.5 bg-black/60 border-y border-current/25 font-mono text-[11px]">
        <div className="text-[10px] opacity-60 uppercase tracking-widest border-b border-current/20 pb-0.5">
          JOURNAL DES ÉCHANGES DE TIRS :
        </div>
        {combatLog.map((log, idx) => (
          <div key={idx} className={`${idx === 0 ? 'font-bold text-current' : 'opacity-70'}`}>
            &gt; {log}
          </div>
        ))}
      </div>

      {/* Panneau d'Actions du Joueur */}
      <div className="p-3 bg-black border-t-2 border-current space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-[11px] font-bold uppercase">
            Cible : <span className="underline">{targetNpc ? targetNpc.name : 'Aucune'}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAnchor}
              className={`px-2 py-1 border text-[10px] uppercase font-bold cursor-pointer ${
                player.isAnchored ? 'border-emerald-400 text-emerald-400' : 'border-current'
              }`}
            >
              {player.isAnchored ? 'Détacher (2 PA)' : 'S\'ancrer (2 PA)'}
            </button>
            <button
              onClick={handleCover}
              className={`px-2 py-1 border text-[10px] uppercase font-bold cursor-pointer ${
                player.inCover ? 'border-cyan-400 text-cyan-400' : 'border-current'
              }`}
            >
              {player.inCover ? 'Quitter couvert (3 PA)' : 'Se couvrir (3 PA)'}
            </button>
          </div>
        </div>

        {/* Boutons d'attaques et de soins */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Tir standard */}
          <button
            onClick={() => handleShoot(false)}
            disabled={ap < 4 || !targetNpc?.isAlive}
            className="p-2 border border-current hover:bg-current hover:text-black font-bold uppercase text-center disabled:opacity-30 cursor-pointer"
          >
            <div>Tir Standard</div>
            <div className="text-[10px] opacity-75">4 PA • Loc. inversée</div>
          </button>

          {/* Tir Visière */}
          <button
            onClick={() => handleShoot(true, 'head')}
            disabled={ap < 6 || !targetNpc?.isAlive}
            className="p-2 border border-current hover:bg-current hover:text-black font-bold uppercase text-center disabled:opacity-30 cursor-pointer"
          >
            <div>Tir Visière</div>
            <div className="text-[10px] opacity-75">6 PA • -30 visée / Mortel</div>
          </button>

          {/* Tir Torse */}
          <button
            onClick={() => handleShoot(true, 'torso')}
            disabled={ap < 5 || !targetNpc?.isAlive}
            className="p-2 border border-current hover:bg-current hover:text-black font-bold uppercase text-center disabled:opacity-30 cursor-pointer"
          >
            <div>Tir au Torse</div>
            <div className="text-[10px] opacity-75">5 PA • -10 visée</div>
          </button>

          {/* Tir Bras (Désarmer) */}
          <button
            onClick={() => handleShoot(true, 'rightArm')}
            disabled={ap < 5 || !targetNpc?.isAlive}
            className="p-2 border border-current hover:bg-current hover:text-black font-bold uppercase text-center disabled:opacity-30 cursor-pointer"
          >
            <div>Désarmer (Bras)</div>
            <div className="text-[10px] opacity-75">5 PA • -20 visée</div>
          </button>

          {/* Rustine */}
          <button
            onClick={handleUsePatch}
            disabled={!patchItem || ap < 3}
            className="p-2 border border-current hover:bg-current hover:text-black font-bold uppercase text-center disabled:opacity-30 cursor-pointer"
          >
            <div>Rustine ({patchItem ? patchItem.quantity : 0})</div>
            <div className="text-[10px] opacity-75">3 PA • Colmater brèche</div>
          </button>

          {/* Medkit */}
          <button
            onClick={handleUseMedkit}
            disabled={!medkitItem || ap < 4}
            className="p-2 border border-current hover:bg-current hover:text-black font-bold uppercase text-center disabled:opacity-30 cursor-pointer"
          >
            <div>Injecteur Medkit</div>
            <div className="text-[10px] opacity-75">4 PA • +3 End / Saignement</div>
          </button>

          {/* Intimidation */}
          <button
            onClick={handleIntimidateInCombat}
            disabled={ap < 3}
            className="p-2 border border-current hover:bg-current hover:text-black font-bold uppercase text-center disabled:opacity-30 cursor-pointer"
          >
            <div>Intimider</div>
            <div className="text-[10px] opacity-75">3 PA • Sang-froid PNJ</div>
          </button>

          {/* Fin de tour */}
          <button
            onClick={handleEndTurn}
            className="p-2 border-2 border-current bg-current/20 hover:bg-current hover:text-black font-black uppercase text-center cursor-pointer"
          >
            <div>Fin du Tour</div>
            <div className="text-[10px] opacity-80">5s • Tour ennemis</div>
          </button>
        </div>
      </div>
    </div>
  );
};
