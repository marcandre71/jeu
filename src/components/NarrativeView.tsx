/**
 * Vue Narrative et Arbre de Dialogues Interactif
 * Style cRPG textuel rétro-futuriste (façon Fallout 1 & 2 / The Expanse)
 */

import React, { useState } from 'react';
import { Actor, DialogueChoice, DialogueNode, EnvironmentalState } from '../types/game';
import { rollD100 } from '../engine/d100';
import { soundFx } from '../engine/audio';
import { DiceRollDisplay } from './DiceRollDisplay';

interface NarrativeViewProps {
  currentNode: DialogueNode;
  player: Actor;
  env: EnvironmentalState;
  onSelectNode: (nodeId: string) => void;
  onTriggerCombat: () => void;
  onUpdateEnv: (updater: (prev: EnvironmentalState) => EnvironmentalState) => void;
  onUpdatePlayer: (updater: (prev: Actor) => Actor) => void;
  onInspectElement: (elem: string) => void;
}

export const NarrativeView: React.FC<NarrativeViewProps> = ({
  currentNode,
  player,
  env,
  onSelectNode,
  onTriggerCombat,
  onUpdateEnv,
  onUpdatePlayer,
  onInspectElement,
}) => {
  const [lastRoll, setLastRoll] = useState<any>(null);
  const [rollFeedback, setRollFeedback] = useState<string | null>(null);

  /**
   * Clic sur un choix de dialogue
   */
  const handleChoiceClick = (choice: DialogueChoice) => {
    soundFx.playKeyClick();

    // S'il y a un test de compétence requis
    if (choice.skillReq) {
      const { skillId, targetScore, difficultyMod, skillName } = choice.skillReq;
      const actualScore = player.skills[skillId] || targetScore;
      
      soundFx.playDiceRoll();
      const result = rollD100(actualScore, difficultyMod);
      setLastRoll(result);

      if (result.isSuccess) {
        soundFx.playCriticalSuccess();
        setRollFeedback(`RÉUSSITE : Test de [${skillName}] réussi avec ${result.dr} Degrés de Réussite !`);

        // Gestion des branches de réussite
        if (choice.nextId === 'check_survie') {
          onUpdateEnv((e) => ({ ...e, turnCountdown: Math.min(12, e.turnCountdown + 2) }));
          setTimeout(() => onSelectNode('survie_success'), 1200);
        } else if (choice.nextId === 'check_medecine') {
          setTimeout(() => onSelectNode('medecine_success'), 1200);
        } else if (choice.nextId === 'check_intimidation') {
          setTimeout(() => onSelectNode('intimidation_success'), 1200);
        } else if (choice.nextId === 'check_vigilance') {
          setTimeout(() => onSelectNode('vigilance_success'), 1200);
        } else if (choice.nextId === 'check_reparation') {
          onUpdateEnv((e) => ({ ...e, heaterRepaired: true, temperatureC: 15.0 }));
          setTimeout(() => onSelectNode('reparer_chauffage_direct'), 1200);
        } else if (choice.nextId === 'check_droit_kael') {
          setTimeout(() => onSelectNode('fin_veille_legale'), 1200);
        } else if (choice.nextId === 'check_deal_voronov') {
          setTimeout(() => onSelectNode('fin_kombinat_trahison'), 1200);
        } else if (choice.nextId === 'check_psy_voronov') {
          setTimeout(() => onSelectNode('destabiliser_voronov_node'), 1200);
        } else if (choice.nextId === 'check_persuasion_lina') {
          setTimeout(() => onSelectNode('soigner_lina_interaction'), 1200);
        } else if (choice.nextId === 'check_desarmer_voronov') {
          setTimeout(() => onSelectNode('arrestation_voronov_node'), 1200);
        } else if (choice.nextId === 'check_persuasion_finale') {
          setTimeout(() => onSelectNode('fin_victoire_diplomatique'), 1200);
        } else {
          setTimeout(() => onSelectNode(choice.nextId), 1000);
        }
      } else {
        soundFx.playCriticalFailure();
        setRollFeedback(`ÉCHEC : Test de [${skillName}] raté avec ${result.de} Degrés d'Échec.`);

        if (choice.nextId === 'check_survie') {
          setTimeout(() => onSelectNode('survie_fail'), 1200);
        } else if (choice.nextId === 'check_medecine') {
          setTimeout(() => onSelectNode('medecine_fail'), 1200);
        } else if (choice.nextId === 'check_intimidation') {
          setTimeout(() => onSelectNode('intimidation_fail'), 1200);
        } else if (choice.nextId === 'check_vigilance') {
          setTimeout(() => onSelectNode('vigilance_fail'), 1200);
        } else {
          setTimeout(() => onSelectNode('combat_escalation'), 1200);
        }
      }
      return;
    }

    // Choix direct sans dé
    if (choice.nextId === 'combat_escalation') {
      soundFx.playWarningBeep();
      onTriggerCombat();
    } else {
      setLastRoll(null);
      setRollFeedback(null);
      onSelectNode(choice.nextId);
    }
  };

  return (
    <div className="flex flex-col h-full font-mono text-xs select-none">
      {/* Barre d'objets examinables dans le sas */}
      <div className="p-2 border-b border-current/30 bg-black/80 flex items-center justify-between text-[11px] overflow-x-auto gap-2">
        <span className="opacity-70 whitespace-nowrap uppercase tracking-wider text-[10px]">
          POINTS D'INTÉRÊT DU SAS :
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onInspectElement('borne_thermique')}
            className="px-2 py-0.5 border border-current/50 hover:border-current hover:bg-current/10 whitespace-nowrap cursor-pointer"
          >
            [Panneau Thermique]
          </button>
          <button
            onClick={() => onInspectElement('conteneur_cryo')}
            className="px-2 py-0.5 border border-current/50 hover:border-current hover:bg-current/10 whitespace-nowrap cursor-pointer text-cyan-400"
          >
            [Conteneur Sereguine]
          </button>
          <button
            onClick={() => onInspectElement('lina')}
            className="px-2 py-0.5 border border-current/50 hover:border-current hover:bg-current/10 whitespace-nowrap cursor-pointer text-yellow-400"
          >
            [Lina (Blessée)]
          </button>
          <button
            onClick={() => onInspectElement('kael')}
            className="px-2 py-0.5 border border-current/50 hover:border-current hover:bg-current/10 whitespace-nowrap cursor-pointer text-cyan-300"
          >
            [Kael (Veille)]
          </button>
          <button
            onClick={() => onInspectElement('voronov')}
            className="px-2 py-0.5 border border-current/50 hover:border-current hover:bg-current/10 whitespace-nowrap cursor-pointer text-rose-400"
          >
            [Voronov (Hélion)]
          </button>
        </div>
      </div>

      {/* Zone de Texte Principal */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-black/50 font-mono text-sm leading-relaxed">
        {/* Identité de l'interlocuteur */}
        <div className="flex items-center gap-2 border-b border-current/30 pb-2">
          <span className="w-2.5 h-2.5 bg-current inline-block animate-pulse"></span>
          <span className="font-bold uppercase tracking-wider text-base">
            {currentNode.speaker}
          </span>
          {currentNode.faction && (
            <span className="text-xs px-1.5 py-0.5 border border-current rounded uppercase opacity-80">
              {currentNode.faction}
            </span>
          )}
        </div>

        {/* Paragraphe narratif */}
        <div className="whitespace-pre-line text-current/95 text-[13px] leading-relaxed">
          {currentNode.text}
        </div>

        {/* Affichage d'un jet de dé intervenu */}
        {lastRoll && (
          <div className="my-2">
            <DiceRollDisplay result={lastRoll} label="Résultat du Test de Compétence D100" />
            {rollFeedback && (
              <div className="text-xs font-bold tracking-wide mt-1 text-center uppercase p-1 bg-current/10 border border-current/30 rounded">
                {rollFeedback}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Zone des Choix de Dialogue / Actions */}
      <div className="p-3 bg-black border-t-2 border-current space-y-2">
        <div className="text-[10px] opacity-70 uppercase tracking-widest border-b border-current/20 pb-1">
          {currentNode.isEnding ? 'CONCLUSION DE LA DÉMO :' : 'ACTIONS ET RÉPONSES DU SAUVETEUR :'}
        </div>

        <div className="space-y-1.5 max-h-52 overflow-y-auto">
          {currentNode.choices.map((choice, index) => {
            const hasSkill = !!choice.skillReq;
            return (
              <button
                key={choice.id}
                onClick={() => handleChoiceClick(choice)}
                className={`w-full text-left p-2.5 border rounded transition-all cursor-pointer flex items-start gap-2.5 group ${
                  hasSkill
                    ? 'border-current/70 bg-current/5 hover:bg-current hover:text-black font-semibold'
                    : 'border-current/40 hover:border-current hover:bg-current/15'
                }`}
              >
                <span className="font-mono text-xs opacity-60 group-hover:opacity-100">
                  [{index + 1}]
                </span>
                <span className="flex-1 text-xs">
                  {choice.text}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
