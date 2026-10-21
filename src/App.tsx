/**
 * SOL, NOUVELLE ÈRE : L'IMPASSE DE L'HABITAT THULÉ-7
 * Démo technique cRPG textuel et interactif Hard-SF
 * Système D100 conforme au Livre de règles v0.2
 */

import React, { useState, useEffect } from 'react';
import { Actor, EnvironmentalState, InventoryItem } from './types/game';
import { INITIAL_PLAYER, INITIAL_NPCS, INITIAL_INVENTORY } from './data/characters';
import { DIALOGUE_NODES } from './data/dialogues';
import { soundFx } from './engine/audio';
import { AtmosphereHUD } from './components/AtmosphereHUD';
import { NarrativeView } from './components/NarrativeView';
import { TacticalCombat } from './components/TacticalCombat';
import { CharacterSheetModal } from './components/CharacterSheetModal';
import { InventoryModal } from './components/InventoryModal';
import { InspectionModal } from './components/InspectionModal';

export default function App() {
  // --- ÉTATS GLOBAUX ---
  const [gameState, setGameState] = useState<'title' | 'narrative' | 'combat' | 'ending'>('title');
  const [colorTheme, setColorTheme] = useState<'amber' | 'green' | 'cyan'>('amber');
  const [hasScanlines, setHasScanlines] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Données de session
  const [player, setPlayer] = useState<Actor>(INITIAL_PLAYER);
  const [npcs, setNpcs] = useState<Record<string, Actor>>(INITIAL_NPCS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [currentNodeId, setCurrentNodeId] = useState<string>('start');
  const [inspectedElement, setInspectedElement] = useState<string | null>(null);

  // État environnemental (Physique stricte)
  const [env, setEnv] = useState<EnvironmentalState>({
    temperatureC: -50.4,
    oxygenPercent: 16.5,
    pressureKPa: 72,
    turnCountdown: 8,
    heaterRepaired: false,
    lifeSupportHacked: false,
    sealStabilized: false,
  });

  // Modales
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState<boolean>(false);

  // Démarrage audio au premier clic
  const handleStartMission = () => {
    soundFx.playConfirm();
    soundFx.startAmbient();
    setGameState('narrative');
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundFx.setMuted(nextMuted);
  };

  /**
   * Avancer le compte à rebours d'un tour (froid et hypoxie)
   */
  const handleAdvanceTurn = () => {
    setEnv((prev) => {
      if (prev.heaterRepaired) {
        return prev;
      }

      const nextTemp = prev.temperatureC - 1.8;
      const nextO2 = Math.max(8.0, prev.oxygenPercent - 0.7);
      const nextPressure = Math.max(45, prev.pressureKPa - 2);
      const nextTurns = prev.turnCountdown - 1;

      soundFx.playWarningBeep();

      if (nextTurns <= 0) {
        // Hypothermie et perte de conscience utile
        setTimeout(() => {
          setCurrentNodeId('fin_defaite_hypoxie');
          setGameState('ending');
        }, 800);
      }

      return {
        ...prev,
        temperatureC: nextTemp,
        oxygenPercent: nextO2,
        pressureKPa: nextPressure,
        turnCountdown: Math.max(0, nextTurns),
      };
    });
  };

  /**
   * Utilisation d'un objet d'inventaire
   */
  const handleUseInventoryItem = (item: InventoryItem) => {
    soundFx.playPneumaticHiss();

    if (item.id === 'rustine') {
      setPlayer((p) => ({
        ...p,
        conditions: p.conditions.filter((c) => c !== 'combinaison_percee'),
        armor: { ...p.armor, sealed: true },
      }));
      setInventory((inv) =>
        inv.map((i) => (i.id === 'rustine' ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i))
      );
      setIsInventoryOpen(false);
    } else if (item.id === 'medkit') {
      setPlayer((p) => ({
        ...p,
        endurance: Math.min(p.maxEndurance, p.endurance + 3),
        conditions: p.conditions.filter((c) => c !== 'saignement'),
      }));
      setInventory((inv) =>
        inv.map((i) => (i.id === 'medkit' ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i))
      );
      setIsInventoryOpen(false);
    } else if (item.id === 'multimetre') {
      // Diagnostic du panneau thermique
      setInspectedElement('borne_thermique');
      setIsInventoryOpen(false);
    }
  };

  const handleConsumeItem = (itemId: string) => {
    setInventory((inv) =>
      inv.map((i) => (i.id === itemId ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i))
    );
  };

  const handleResetGame = () => {
    setPlayer(INITIAL_PLAYER);
    setNpcs(INITIAL_NPCS);
    setInventory(INITIAL_INVENTORY);
    setEnv({
      temperatureC: -50.4,
      oxygenPercent: 16.5,
      pressureKPa: 72,
      turnCountdown: 8,
      heaterRepaired: false,
      lifeSupportHacked: false,
      sealStabilized: false,
    });
    setCurrentNodeId('start');
    setGameState('title');
  };

  // Raccourcis clavier pour l'immersion rétro
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'title' && (e.key === 'Enter' || e.key === ' ')) {
        handleStartMission();
      } else if (e.key.toLowerCase() === 'c') {
        setIsSheetOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'i') {
        setIsInventoryOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  const currentNode = DIALOGUE_NODES[currentNodeId] || DIALOGUE_NODES['start'];

  return (
    <div
      className={`w-screen h-screen flex flex-col overflow-hidden select-none ${
        colorTheme === 'amber'
          ? 'theme-amber'
          : colorTheme === 'green'
          ? 'theme-green'
          : 'theme-cyan'
      } ${hasScanlines ? 'scanlines' : ''}`}
    >
      {/* Barre Supérieure du Châssis Terminal */}
      <nav className="h-8 bg-black border-b border-current/40 px-3 flex items-center justify-between font-mono text-[11px] shrink-0 z-20">
        <div className="flex items-center gap-3">
          <span className="font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
            TERMINAL MUTUELLE MK.VII // 2187
          </span>
          <span className="opacity-60 hidden md:inline">
            SYSTEM D100 v0.2 • HARD SCI-FI
          </span>
        </div>

        {/* Contrôles du Terminal */}
        <div className="flex items-center gap-2">
          {/* Commutateur de phosphore */}
          <div className="flex border border-current/50 rounded overflow-hidden text-[10px]">
            <button
              onClick={() => setColorTheme('amber')}
              className={`px-1.5 py-0.5 cursor-pointer ${colorTheme === 'amber' ? 'bg-current text-black font-bold' : ''}`}
              title="Phosphore Ambre"
            >
              AMB
            </button>
            <button
              onClick={() => setColorTheme('green')}
              className={`px-1.5 py-0.5 cursor-pointer ${colorTheme === 'green' ? 'bg-current text-black font-bold' : ''}`}
              title="Phosphore Vert"
            >
              VERT
            </button>
            <button
              onClick={() => setColorTheme('cyan')}
              className={`px-1.5 py-0.5 cursor-pointer ${colorTheme === 'cyan' ? 'bg-current text-black font-bold' : ''}`}
              title="Cyan Glacé"
            >
              CYAN
            </button>
          </div>

          {/* Scanlines Toggle */}
          <button
            onClick={() => setHasScanlines((prev) => !prev)}
            className="px-1.5 py-0.5 border border-current/50 hover:bg-current/15 rounded text-[10px] cursor-pointer"
            title="Activer/Désactiver les lignes de balayage CRT"
          >
            {hasScanlines ? 'SCAN: ON' : 'SCAN: OFF'}
          </button>

          {/* Son Toggle */}
          <button
            onClick={handleToggleMute}
            className="px-1.5 py-0.5 border border-current/50 hover:bg-current/15 rounded text-[10px] cursor-pointer"
            title="Activer/Désactiver l'audio"
          >
            {isMuted ? 'AUDIO: OFF' : 'AUDIO: ON'}
          </button>
        </div>
      </nav>

      {/* --- ÉCRAN TITRE RETRO --- */}
      {gameState === 'title' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-black relative crt-screen">
          <div className="max-w-2xl w-full text-center space-y-6 animate-fadeIn">
            {/* Logo Vectoriel Rétro-Futuriste */}
            <div className="flex justify-center">
              <svg className="w-20 h-20 text-current animate-pulse" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="50" cy="50" r="42" strokeDasharray="6 3" />
                <circle cx="50" cy="50" r="28" />
                <polygon points="50,15 85,75 15,75" strokeWidth="1.5" />
                <line x1="50" y1="10" x2="50" y2="90" strokeWidth="1" strokeDasharray="2 2" />
                <circle cx="50" cy="50" r="4" fill="currentColor" />
              </svg>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-widest uppercase crt-glow">
                SOL, NOUVELLE ÈRE
              </h1>
              <div className="text-xs sm:text-sm font-bold tracking-wider mt-1 opacity-80 uppercase">
                L'Impasse de l'Habitat Thulé-7 (2187)
              </div>
              <div className="text-[11px] opacity-60 mt-1 uppercase">
                Démo cRPG Textuel & Tactique Hard-SF • Système D100 v0.2
              </div>
            </div>

            {/* Briefing de l'univers */}
            <div className="p-4 border-2 border-current bg-current/5 rounded text-left text-xs leading-relaxed space-y-2 font-mono">
              <p className="font-bold text-sm border-b border-current/30 pb-1 uppercase">
                [PARAMÈTRES DE MISSION // CEINTURE D'ASTÉROÏDES]
              </p>
              <p>
                <strong>2187.</strong> Ni distorsion, ni boucliers d'énergie. La physique newtonienne est impitoyable : chaque poussée exige du delta-v, et le recul d'une arme à feu en apesanteur vous propulse dans le vide. Les transmissions radio mettent quarante minutes à traverser le système.
              </p>
              <p>
                Vous incarnez un Sauveteur de la <strong>Mutuelle</strong>. L'habitat minier Thulé-7 ne répond plus depuis 19 jours. L'Office de la Veille l'a placé sous quarantaine sanitaire, mais votre syndicat vous y a envoyé en douce.
              </p>
              <p>
                Dans le sas principal, la température est à <strong>-50°C</strong> et trois survivants se tiennent en joue pour le contrôle d'un conteneur cryogénique renfermant des échantillons illégaux de la comète Sereguine...
              </p>
            </div>

            {/* CTA principal */}
            <div className="space-y-3">
              <button
                onClick={handleStartMission}
                className="w-full sm:w-auto px-8 py-3.5 border-2 border-current bg-current text-black font-black text-sm uppercase tracking-widest hover:bg-black hover:text-current transition-all cursor-pointer shadow-lg active:scale-95"
              >
                [FRANCHIR LE SAS // ENTRER SUR THULÉ-7]
              </button>

              <div className="text-[11px] opacity-75 font-mono">
                Appuyez sur <span className="font-bold underline">Entrée</span> ou <span className="font-bold underline">Espace</span> • [C] Fiche D100 • [I] Équipement
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- EN JEU (NARRATIF OU COMBAT) --- */}
      {gameState !== 'title' && (
        <div className="flex-1 flex flex-col min-h-0 bg-black crt-screen relative">
          {/* HUD Atmosphérique Fixe en haut */}
          <AtmosphereHUD
            env={env}
            player={player}
            onOpenSheet={() => setIsSheetOpen(true)}
            onOpenInventory={() => setIsInventoryOpen(true)}
            colorTheme={colorTheme}
          />

          {/* Vue Principale */}
          <main className="flex-1 min-h-0 relative">
            {gameState === 'narrative' && (
              <NarrativeView
                currentNode={currentNode}
                player={player}
                env={env}
                onSelectNode={(nodeId) => {
                  setCurrentNodeId(nodeId);
                  const node = DIALOGUE_NODES[nodeId];
                  if (node?.isCombatTrigger) {
                    setGameState('combat');
                  } else if (node?.isEnding) {
                    setGameState('ending');
                  } else {
                    handleAdvanceTurn();
                  }
                }}
                onTriggerCombat={() => setGameState('combat')}
                onUpdateEnv={setEnv}
                onUpdatePlayer={setPlayer}
                onInspectElement={(elem) => setInspectedElement(elem)}
              />
            )}

            {gameState === 'combat' && (
              <TacticalCombat
                player={player}
                npcs={npcs}
                onUpdatePlayer={setPlayer}
                onUpdateNpc={(npcId, updater) => {
                  setNpcs((prev) => ({
                    ...prev,
                    [npcId]: updater(prev[npcId]),
                  }));
                }}
                onAdvanceTurn={handleAdvanceTurn}
                onVictory={(endingId) => {
                  setCurrentNodeId(endingId);
                  setGameState('ending');
                }}
                onDefeat={(endingId) => {
                  setCurrentNodeId(endingId);
                  setGameState('ending');
                }}
                inventory={inventory}
                onConsumeItem={handleConsumeItem}
              />
            )}

            {gameState === 'ending' && (
              <div className="h-full flex flex-col justify-between p-6 bg-black/90 font-mono text-xs overflow-y-auto">
                <div className="max-w-xl mx-auto space-y-4 my-auto">
                  <div className="p-3 border-2 border-current bg-current/10 text-center">
                    <span className="text-sm font-bold uppercase tracking-wider block">
                      {currentNode.speaker}
                    </span>
                  </div>

                  <div className="p-4 border border-current/40 bg-black/80 rounded leading-relaxed text-sm whitespace-pre-line">
                    {currentNode.text}
                  </div>

                  <div className="p-3 border border-current/25 bg-current/5 rounded text-[11px] space-y-1">
                    <div className="font-bold uppercase border-b border-current/20 pb-0.5">
                      RAPPORT MÉDICAL & ENVIRONNEMENTAL DE FIN :
                    </div>
                    <div>Température finale du sas : <strong>{env.temperatureC.toFixed(1)}°C</strong></div>
                    <div>Endurance du Sauveteur : <strong>{player.endurance} / {player.maxEndurance}</strong></div>
                    <div>Dose de radiations cumulée : <strong>{player.radiationAigue + player.radiationCumulee} mSv</strong></div>
                    <div>Survie de Lina Kovalenko : <strong>{npcs.lina.isAlive ? 'VIVANTE' : 'DÉCÉDÉE'}</strong></div>
                  </div>

                  <div className="text-center pt-2">
                    <button
                      onClick={handleResetGame}
                      className="px-6 py-2.5 border-2 border-current bg-current text-black font-black uppercase text-xs cursor-pointer hover:bg-black hover:text-current transition-colors"
                    >
                      [RECOMMENCER LA MISSION // NOUVELLE PARTIE]
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {/* --- MODALES GLOBAUX --- */}
      <CharacterSheetModal
        actor={player}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />

      <InventoryModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        inventory={inventory}
        onUseItem={handleUseInventoryItem}
        isCombat={gameState === 'combat'}
      />

      <InspectionModal
        elementId={inspectedElement}
        onClose={() => setInspectedElement(null)}
        player={player}
        env={env}
        onRepairAttempt={() => {
          soundFx.playConfirm();
          setEnv((prev) => ({ ...prev, heaterRepaired: true, temperatureC: 18.0 }));
          setCurrentNodeId('reparer_chauffage_direct');
        }}
      />
    </div>
  );
}
