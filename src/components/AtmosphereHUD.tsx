/**
 * HUD Environnemental et Télémétrie de Combinaison
 * Présente la physique hard-SF (température -50°C, microgravité 0.04g,
 * dépressurisation, dose de radiations mSv, et compte à rebours d'hypoxie).
 */

import React from 'react';
import { Actor, EnvironmentalState } from '../types/game';

interface AtmosphereHUDProps {
  env: EnvironmentalState;
  player: Actor;
  onOpenSheet: () => void;
  onOpenInventory: () => void;
  colorTheme: 'amber' | 'green' | 'cyan';
}

export const AtmosphereHUD: React.FC<AtmosphereHUDProps> = ({
  env,
  player,
  onOpenSheet,
  onOpenInventory,
  colorTheme,
}) => {
  // Détermination du palier de radiation selon le livre de règles
  const radLevel = player.radiationAigue < 250 
    ? { label: 'SAIN', color: 'text-emerald-400 bg-emerald-950/60' }
    : player.radiationAigue < 1000
    ? { label: 'EXPOSÉ', color: 'text-yellow-400 bg-yellow-950/60' }
    : player.radiationAigue < 3000
    ? { label: 'IRRADIÉ', color: 'text-amber-500 bg-amber-950/60' }
    : { label: 'CONDAMNÉ', color: 'text-rose-500 bg-rose-950/60' };

  // État critique de température
  const isFreezing = env.temperatureC <= -55;
  const isLowOxygen = env.oxygenPercent <= 14;

  return (
    <header className="border-b-2 border-current bg-black/95 px-3 py-2 font-mono text-xs shadow-md select-none">
      {/* Ligne 1 : Statut de mission et paramètres physiques stricts */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-current/25 pb-1.5 mb-1.5">
        <div className="flex items-center gap-2">
          <span className="font-black tracking-widest px-1.5 py-0.5 border border-current bg-current/10 uppercase">
            SOL-2187 // THULÉ-7
          </span>
          <span className="opacity-80 hidden sm:inline">
            SAS PRINCIPAL - SECTEUR CEINTURE MINIER
          </span>
        </div>

        {/* Boutons d'accès Fiche et Inventaire */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenInventory}
            className="px-2 py-0.5 border border-current hover:bg-current hover:text-black transition-colors font-bold uppercase cursor-pointer"
          >
            [EQUIPEMENT]
          </button>
          <button
            onClick={onOpenSheet}
            className="px-2 py-0.5 border border-current hover:bg-current hover:text-black transition-colors font-bold uppercase cursor-pointer"
          >
            [FICHE D100]
          </button>
        </div>
      </div>

      {/* Ligne 2 : Capteurs environnementaux en temps réel */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-[11px]">
        {/* Température */}
        <div className={`p-1.5 border rounded flex flex-col justify-between ${
          isFreezing ? 'border-rose-500 bg-rose-950/40 animate-pulse text-rose-300' : 'border-current/40 bg-current/5'
        }`}>
          <span className="opacity-70 text-[9px] uppercase tracking-wider">TEMP. AMBIANTE</span>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-sm font-bold">{env.temperatureC.toFixed(1)}°C</span>
            <span className="text-[10px] opacity-75">{env.heaterRepaired ? 'STABILISÉ' : 'CHUTE'}</span>
          </div>
        </div>

        {/* Oxygène */}
        <div className={`p-1.5 border rounded flex flex-col justify-between ${
          isLowOxygen ? 'border-rose-500 bg-rose-950/40 animate-pulse text-rose-300' : 'border-current/40 bg-current/5'
        }`}>
          <span className="opacity-70 text-[9px] uppercase tracking-wider">OXYGÈNE O2</span>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-sm font-bold">{env.oxygenPercent.toFixed(1)}%</span>
            <span className="text-[10px] opacity-75">{env.pressureKPa} kPa</span>
          </div>
        </div>

        {/* Gravité stricte */}
        <div className="p-1.5 border border-current/40 bg-current/5 rounded flex flex-col justify-between">
          <span className="opacity-70 text-[9px] uppercase tracking-wider">GRAVITÉ (SOL)</span>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-sm font-bold">0.04 g</span>
            <span className="text-[10px] opacity-75">MICROGRAV.</span>
          </div>
        </div>

        {/* Compte à rebours de survie */}
        <div className={`p-1.5 border rounded flex flex-col justify-between ${
          env.turnCountdown <= 3 ? 'border-rose-500 bg-rose-950/50 animate-pulse text-rose-400 font-bold' : 'border-current/40 bg-current/5'
        }`}>
          <span className="opacity-70 text-[9px] uppercase tracking-wider">HORLOGE SURVIE</span>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-sm font-bold">
              {env.heaterRepaired ? 'SÉCURISÉE' : `${env.turnCountdown} TOURS`}
            </span>
            <span className="text-[10px] opacity-75">
              {env.heaterRepaired ? 'OK' : 'URGENCE'}
            </span>
          </div>
        </div>

        {/* Endurance du joueur */}
        <div className="p-1.5 border border-current/40 bg-current/5 rounded flex flex-col justify-between">
          <span className="opacity-70 text-[9px] uppercase tracking-wider">ENDURANCE</span>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-sm font-bold">
              {player.endurance} / {player.maxEndurance}
            </span>
            <span className="text-[10px] opacity-75">SB: {player.sb}</span>
          </div>
        </div>

        {/* Dosimètre de Radiation */}
        <div className="p-1.5 border border-current/40 bg-current/5 rounded flex flex-col justify-between">
          <span className="opacity-70 text-[9px] uppercase tracking-wider">DOSIMÈTRE</span>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-sm font-bold">{player.radiationAigue} mSv</span>
            <span className={`text-[9px] px-1 rounded font-bold ${radLevel.color}`}>
              {radLevel.label}
            </span>
          </div>
        </div>
      </div>

      {/* Alerte si combinaison percée ou saignement */}
      {(player.conditions.includes('combinaison_percee') || player.conditions.includes('saignement')) && (
        <div className="mt-2 p-1 bg-rose-950 border border-rose-500 text-rose-300 flex items-center justify-between text-xs animate-pulse">
          <span className="font-bold flex items-center gap-2">
            <span>⚠ ATTENTION :</span>
            {player.conditions.includes('combinaison_percee') && <span>COMBINAISON PERCÉE (DÉPRESSURISATION)</span>}
            {player.conditions.includes('saignement') && <span>SAIGNEMENT ACTIF (-1 ENDURANCE/TOUR)</span>}
          </span>
          <span className="text-[10px] underline">UTILISER RUSTINE / MEDKIT IMMÉDIATEMENT</span>
        </div>
      )}
    </header>
  );
};
