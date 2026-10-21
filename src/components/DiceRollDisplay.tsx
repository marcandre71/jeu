/**
 * Affichage du lancer de dés D100 "Sol, Nouvelle Ère"
 * Montre les dés D10 dizaines et unités, le score comparé, les DR/DE,
 * et le calcul de la localisation inversée.
 */

import React from 'react';
import { DiceRollResult } from '../types/game';
import { getLocationLabelFr } from '../engine/d100';

interface DiceRollDisplayProps {
  result: DiceRollResult | null;
  label?: string;
  isCombatRoll?: boolean;
}

export const DiceRollDisplay: React.FC<DiceRollDisplayProps> = ({
  result,
  label = 'Test D100',
  isCombatRoll = false,
}) => {
  if (!result) return null;

  const isSuccess = result.isSuccess;
  const isCrit = result.isCriticalSuccess;
  const isFumble = result.isCriticalFailure;

  return (
    <div className="my-3 p-3 bg-black/80 border border-current rounded font-mono text-sm shadow-inner transition-all animate-fadeIn">
      {/* En-tête du jet */}
      <div className="flex items-center justify-between border-b border-current/30 pb-1 mb-2 text-xs uppercase tracking-wider">
        <span className="font-bold flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 bg-current animate-pulse"></span>
          {label}
        </span>
        <span>
          Score cible : <span className="font-bold">{result.modifiedScore}%</span>
          {result.modifiedScore !== result.score && (
            <span className="opacity-70 ml-1">
              ({result.score} {result.modifiedScore > result.score ? `+${result.modifiedScore - result.score}` : result.modifiedScore - result.score})
            </span>
          )}
        </span>
      </div>

      {/* Affichage des deux dés */}
      <div className="flex items-center justify-between gap-4 py-1">
        <div className="flex items-center gap-2">
          {/* Dé des dizaines */}
          <div className="w-12 h-12 border-2 border-current rounded flex flex-col items-center justify-center bg-black shadow-md">
            <span className="text-[10px] opacity-60 leading-none">DIZ</span>
            <span className="text-xl font-bold leading-none">{result.tens * 10}</span>
          </div>

          <span className="text-lg font-bold opacity-50">+</span>

          {/* Dé des unités */}
          <div className="w-12 h-12 border-2 border-current rounded flex flex-col items-center justify-center bg-black shadow-md">
            <span className="text-[10px] opacity-60 leading-none">UNI</span>
            <span className="text-xl font-bold leading-none">{result.units}</span>
          </div>

          <span className="text-lg font-bold opacity-50">=</span>

          {/* Résultat brut */}
          <div className={`px-3 py-1.5 border-2 rounded font-black text-2xl tracking-wider ${
            isCrit 
              ? 'border-emerald-400 text-emerald-300 bg-emerald-950/40 animate-pulse'
              : isFumble
              ? 'border-rose-500 text-rose-400 bg-rose-950/40'
              : isSuccess
              ? 'border-current bg-current/10'
              : 'border-current/40 opacity-70'
          }`}>
            {result.roll.toString().padStart(2, '0')}
          </div>
        </div>

        {/* Verdict et Degrés */}
        <div className="text-right flex flex-col justify-center">
          <div className="text-base font-bold tracking-wide">
            {isCrit && <span className="text-emerald-400">★ RÉUSSITE CRITIQUE ★</span>}
            {isFumble && <span className="text-rose-400">✖ ÉCHEC CRITIQUE ✖</span>}
            {!isCrit && !isFumble && isSuccess && <span className="text-emerald-400">RÉUSSITE</span>}
            {!isCrit && !isFumble && !isSuccess && <span className="text-rose-400">ÉCHEC</span>}
          </div>

          <div className="text-xs opacity-90 mt-0.5">
            {isSuccess ? (
              <span>
                Degrés de Réussite (DR) : <strong className="text-sm font-bold">{result.dr}</strong>
                {result.dr === 0 && <span className="opacity-75 ml-1">(de justesse)</span>}
              </span>
            ) : (
              <span>
                Degrés d'Échec (DE) : <strong className="text-sm font-bold">{result.de}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Règle spécifique combat : inversion du dé pour localisation */}
      {isCombatRoll && isSuccess && (
        <div className="mt-2 pt-2 border-t border-current/20 flex items-center justify-between text-xs bg-current/5 px-2 py-1 rounded">
          <span className="opacity-80">
            Localisation par inversion du dé [{result.roll.toString().padStart(2, '0')} ➔ {result.reversedRoll.toString().padStart(2, '0')}] :
          </span>
          <span className="font-bold underline">
            {result.location ? getLocationLabelFr(result.location) : 'Torse'}
          </span>
        </div>
      )}
    </div>
  );
};
