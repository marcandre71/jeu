/**
 * Fiche de Personnage D100 "Sol, Nouvelle Ère"
 * Conforme au Livre de règles (brouillon v0.2)
 */

import React, { useState } from 'react';
import { Actor } from '../types/game';

interface CharacterSheetModalProps {
  actor: Actor;
  isOpen: boolean;
  onClose: () => void;
}

export const CharacterSheetModal: React.FC<CharacterSheetModalProps> = ({
  actor,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'competences' | 'armure' | 'regles'>('stats');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-xs font-mono text-xs">
      <div className="w-full max-w-3xl max-h-[90vh] bg-black border-2 border-current rounded shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
        {/* En-tête */}
        <div className="flex items-center justify-between p-3 border-b-2 border-current bg-current/10">
          <div>
            <div className="text-sm font-bold tracking-wider uppercase">
              FICHE D100 // {actor.name}
            </div>
            <div className="opacity-75 text-[11px]">
              {actor.title} • Origine : {actor.origin} • Faction : {actor.faction}
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-2.5 py-1 border border-current hover:bg-current hover:text-black font-bold cursor-pointer"
          >
            [FERMER ✕]
          </button>
        </div>

        {/* Onglets */}
        <div className="flex border-b border-current/30 text-[11px] bg-black">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3 py-1.5 border-r border-current/30 cursor-pointer ${
              activeTab === 'stats' ? 'bg-current text-black font-bold' : 'hover:bg-current/15'
            }`}
          >
            CARACTÉRISTIQUES
          </button>
          <button
            onClick={() => setActiveTab('competences')}
            className={`px-3 py-1.5 border-r border-current/30 cursor-pointer ${
              activeTab === 'competences' ? 'bg-current text-black font-bold' : 'hover:bg-current/15'
            }`}
          >
            COMPÉTENCES D100
          </button>
          <button
            onClick={() => setActiveTab('armure')}
            className={`px-3 py-1.5 border-r border-current/30 cursor-pointer ${
              activeTab === 'armure' ? 'bg-current text-black font-bold' : 'hover:bg-current/15'
            }`}
          >
            ARMURE & PROTECTION
          </button>
          <button
            onClick={() => setActiveTab('regles')}
            className={`px-3 py-1.5 cursor-pointer ${
              activeTab === 'regles' ? 'bg-current text-black font-bold' : 'hover:bg-current/15'
            }`}
          >
            AIDE DE JEU (RÈGLES D100)
          </button>
        </div>

        {/* Corps défilable */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'stats' && (
            <div className="space-y-4">
              {/* Grille des 9 caractéristiques */}
              <div>
                <h4 className="font-bold border-b border-current/30 pb-1 mb-2 uppercase text-[11px]">
                  Les 9 Caractéristiques Fondamentales (sur 100)
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 border border-current/30 bg-current/5 rounded">
                    <span className="opacity-70 text-[10px]">FORCE (FOR)</span>
                    <div className="text-base font-bold">{actor.characteristics.for}</div>
                    <span className="text-[9px] opacity-60">Corps-à-corps, charges</span>
                  </div>
                  <div className="p-2 border border-current/30 bg-current/5 rounded">
                    <span className="opacity-70 text-[10px]">CONSTITUTION (CON)</span>
                    <div className="text-base font-bold">{actor.characteristics.con}</div>
                    <span className="text-[9px] opacity-60">Endurance, accélérations</span>
                  </div>
                  <div className="p-2 border border-current/30 bg-current/5 rounded">
                    <span className="opacity-70 text-[10px]">COORDINATION (COO)</span>
                    <div className="text-base font-bold">{actor.characteristics.coo}</div>
                    <span className="text-[9px] opacity-60">Tir, manipulation fine</span>
                  </div>

                  <div className="p-2 border border-current/30 bg-current/5 rounded">
                    <span className="opacity-70 text-[10px]">RÉFLEXES (RÉF)</span>
                    <div className="text-base font-bold">{actor.characteristics.ref}</div>
                    <span className="text-[9px] opacity-60">Initiative, esquive</span>
                  </div>
                  <div className="p-2 border border-current/30 bg-current/5 rounded">
                    <span className="opacity-70 text-[10px]">ADAPTATION SPATIALE (ADA)</span>
                    <div className="text-base font-bold text-emerald-400">{actor.characteristics.ada}</div>
                    <span className="text-[9px] opacity-60">Apesanteur, orientation 3D</span>
                  </div>
                  <div className="p-2 border border-current/30 bg-current/5 rounded">
                    <span className="opacity-70 text-[10px]">PERCEPTION (PER)</span>
                    <div className="text-base font-bold">{actor.characteristics.per}</div>
                    <span className="text-[9px] opacity-60">Vigilance, instruments</span>
                  </div>

                  <div className="p-2 border border-current/30 bg-current/5 rounded">
                    <span className="opacity-70 text-[10px]">INTELLECT (INT)</span>
                    <div className="text-base font-bold">{actor.characteristics.int}</div>
                    <span className="text-[9px] opacity-60">Survie, technique, sciences</span>
                  </div>
                  <div className="p-2 border border-current/30 bg-current/5 rounded">
                    <span className="opacity-70 text-[10px]">VOLONTÉ (VOL)</span>
                    <div className="text-base font-bold">{actor.characteristics.vol}</div>
                    <span className="text-[9px] opacity-60">Sang-froid, stress, peur</span>
                  </div>
                  <div className="p-2 border border-current/30 bg-current/5 rounded">
                    <span className="opacity-70 text-[10px]">PRÉSENCE (PRÉ)</span>
                    <div className="text-base font-bold">{actor.characteristics.pre}</div>
                    <span className="text-[9px] opacity-60">Persuasion, négociation</span>
                  </div>
                </div>
              </div>

              {/* Valeurs Dérivées */}
              <div>
                <h4 className="font-bold border-b border-current/30 pb-1 mb-2 uppercase text-[11px]">
                  Valeurs Dérivées & Dépenses Vitales
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2 border border-current/40 rounded">
                    <span className="opacity-70 text-[10px]">SEUIL BLESSURE (SB)</span>
                    <div className="text-lg font-bold">{actor.sb}</div>
                    <span className="text-[9px] opacity-60">(FOR + CON) / 20</span>
                  </div>
                  <div className="p-2 border border-current/40 rounded">
                    <span className="opacity-70 text-[10px]">ENDURANCE</span>
                    <div className="text-lg font-bold">{actor.endurance} / {actor.maxEndurance}</div>
                    <span className="text-[9px] opacity-60">CON / 5 (froid, fatigue)</span>
                  </div>
                  <div className="p-2 border border-current/40 rounded">
                    <span className="opacity-70 text-[10px]">SANG-FROID</span>
                    <div className="text-lg font-bold">{actor.sangFroid} / {actor.maxSangFroid}</div>
                    <span className="text-[9px] opacity-60">VOL / 5 (stress)</span>
                  </div>
                  <div className="p-2 border border-current/40 rounded">
                    <span className="opacity-70 text-[10px]">TOLÉRANCE AUX G (TG)</span>
                    <div className="text-lg font-bold">{actor.toleranceG} g</div>
                    <span className="text-[9px] opacity-60">Modifié par la Ceinture (-2)</span>
                  </div>
                </div>
              </div>

              {/* Trait d'origine Ceinturien */}
              <div className="p-2.5 border border-current/40 bg-current/5 rounded">
                <span className="font-bold text-[11px] block text-emerald-400">
                  TRAIT CEINTURIEN : PIED MARIN DU VIDE
                </span>
                <p className="opacity-80 text-[11px] mt-0.5">
                  Né dans les cavernes gravimétriques de Cérès (0.04g). Vous ignorez la première pénalité de recul lors d'un tir d'arme à feu en apesanteur. Ne supporte pas durablement plus de 0.5 g d'accélération.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'competences' && (
            <div className="space-y-3">
              <h4 className="font-bold border-b border-current/30 pb-1 mb-2 uppercase text-[11px]">
                Compétences Actives (Caractéristique + Formation)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(actor.skills).map(([key, score]) => {
                  const names: Record<string, string> = {
                    'systemes_survie': 'Systèmes de survie (INT)',
                    'premiers_secours': 'Premiers secours (INT)',
                    'medecine': 'Médecine (INT) (F)',
                    'armes_poing': 'Armes de poing (COO)',
                    'manoeuvre_apesanteur': 'Manœuvre en apesanteur (ADA)',
                    'electronique': 'Électronique (INT)',
                    'mecanique': 'Mécanique (INT)',
                    'intimidation': 'Intimidation (VOL)',
                    'persuasion': 'Persuasion (PRÉ)',
                    'negociation': 'Négociation (PRÉ)',
                    'psychologie': 'Psychologie (PER)',
                    'bureaucratie_droit': 'Bureaucratie et droit (INT)',
                    'vigilance': 'Vigilance (PER)',
                    'fouille': 'Fouille (PER)',
                    'esquive': 'Esquive (RÉF)',
                  };
                  return (
                    <div
                      key={key}
                      className="p-1.5 border border-current/25 bg-current/5 rounded flex items-center justify-between"
                    >
                      <span className="opacity-90">{names[key] || key}</span>
                      <span className="font-bold text-sm bg-current/15 px-2 py-0.5 rounded">
                        {score}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'armure' && (
            <div className="space-y-3">
              <div className="p-3 border border-current/40 rounded bg-current/5">
                <div className="flex items-center justify-between border-b border-current/30 pb-1 mb-2">
                  <span className="font-bold text-sm">{actor.armor.name}</span>
                  <span className="text-[10px] uppercase px-1.5 py-0.5 border border-current">
                    {actor.armor.pressurized ? 'Pressurisée' : 'Non-pressurisée'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  <div className="p-1.5 border border-current/25 rounded">
                    <span className="opacity-60 text-[10px]">TÊTE / VISIÈRE</span>
                    <div className="text-base font-bold">{actor.armor.protection.head} pts</div>
                  </div>
                  <div className="p-1.5 border border-current/25 rounded">
                    <span className="opacity-60 text-[10px]">TORSE</span>
                    <div className="text-base font-bold">{actor.armor.protection.torso} pts</div>
                  </div>
                  <div className="p-1.5 border border-current/25 rounded">
                    <span className="opacity-60 text-[10px]">BRAS</span>
                    <div className="text-base font-bold">{actor.armor.protection.rightArm} pts</div>
                  </div>
                  <div className="p-1.5 border border-current/25 rounded">
                    <span className="opacity-60 text-[10px]">JAMBES</span>
                    <div className="text-base font-bold">{actor.armor.protection.rightLeg} pts</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-current/20">
                  <span>Seuil de perforation / brèche : <strong>{actor.armor.breachThreshold} dégâts bruts</strong></span>
                  <span>Autonomie d'air dorsale : <strong>{actor.armor.airReserveHours} h</strong></span>
                </div>
              </div>

              {/* État de l'arme équipée */}
              <div className="p-3 border border-current/40 rounded bg-current/5">
                <div className="flex items-center justify-between border-b border-current/30 pb-1 mb-2">
                  <span className="font-bold text-sm">{actor.weapon.name}</span>
                  <span className="text-[10px] uppercase px-1.5 py-0.5 border border-current">
                    Munitions {actor.weapon.ammoType}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-1 border border-current/20">
                    <span className="opacity-60 text-[10px]">DÉGÂTS BASE</span>
                    <div className="font-bold text-base">{actor.weapon.damage}</div>
                  </div>
                  <div className="p-1 border border-current/20">
                    <span className="opacity-60 text-[10px]">CHARGEUR</span>
                    <div className="font-bold text-base">{actor.weapon.ammo} / {actor.weapon.maxAmmo}</div>
                  </div>
                  <div className="p-1 border border-current/20">
                    <span className="opacity-60 text-[10px]">COÛT PA</span>
                    <div className="font-bold text-base">{actor.weapon.apCost} PA</div>
                  </div>
                </div>
                <p className="text-[10px] opacity-75 mt-2">
                  Munition frangible : Ne perce pas la coque d'un habitat. En apesanteur, un tir non ancré engendre un recul newtonien.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'regles' && (
            <div className="space-y-3 text-[11px] leading-relaxed">
              <div className="p-2.5 border border-current/30 bg-current/5 rounded">
                <span className="font-bold text-emerald-400 block mb-1">RÈGLE 1 : LE JET D100 ET LES DEGRÉS</span>
                <p>
                  Lance 1D100 et fais inférieur ou égal à ton score.
                  Les Degrés de Réussite (DR) se lisent directement sur le chiffre des dizaines : <br />
                  <code className="text-current bg-black px-1">DR = dizaine(score) - dizaine(dé)</code>.
                </p>
              </div>

              <div className="p-2.5 border border-current/30 bg-current/5 rounded">
                <span className="font-bold text-emerald-400 block mb-1">RÈGLE 2 : LES CRITIQUES ET LES DOUBLES</span>
                <p>
                  01 à 05 : Réussite critique automatique.<br />
                  96 à 100 : Échec critique automatique.<br />
                  Entre 06 et 95 : tout double (11, 22... 88) est critique : réussite si ≤ score, échec si &gt; score.
                </p>
              </div>

              <div className="p-2.5 border border-current/30 bg-current/5 rounded">
                <span className="font-bold text-emerald-400 block mb-1">RÈGLE 3 : LOCALISATION PAR INVERSION DU DÉ</span>
                <p>
                  En tir standard, on inverse les chiffres du dé pour déterminer la zone touchée (ex: 37 ➔ 73 = Jambe droite ; 10 ➔ 01 = Tête).
                </p>
              </div>

              <div className="p-2.5 border border-current/30 bg-current/5 rounded">
                <span className="font-bold text-emerald-400 block mb-1">RÈGLE 4 : PHYSIQUE EN APESANTEUR</span>
                <p>
                  La 3e loi de Newton s'applique : chaque tir d'arme à feu sans ancrage magnétique vous repousse en arrière et impose un test de Manœuvre en apesanteur.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
