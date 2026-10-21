/**
 * Modale d'inspection détaillée des objets et personnages du sas Thulé-7
 */

import React from 'react';
import { Actor, EnvironmentalState } from '../types/game';

interface InspectionModalProps {
  elementId: string | null;
  onClose: () => void;
  player: Actor;
  env: EnvironmentalState;
  onRepairAttempt?: () => void;
}

export const InspectionModal: React.FC<InspectionModalProps> = ({
  elementId,
  onClose,
  player,
  env,
  onRepairAttempt,
}) => {
  if (!elementId) return null;

  const getContent = () => {
    switch (elementId) {
      case 'borne_thermique':
        return {
          title: 'PANNEAU THERMIQUE DU SAS // MODÈLE CEINTURE-HEATER-4',
          description: `Le circuit caloporteur primaire à ammoniac s'est figé. Les tuyaux sont couverts d'une croûte de givre blanc. 
L'écran matriciel affiche : 
[AVARIE CHAUFFAGE - TEMPÉRATURE ACTUELLE : ${env.temperatureC.toFixed(1)}°C]
[COMPTE À REBOURS AVANT GÈLE CRITIQUE DES PILES : ${env.turnCountdown} TOURS]

Un sauveteur qualifié en [Systèmes de survie] ou [Électronique] peut shunter la boucle de chauffage d'urgence pour réchauffer la pièce à +18°C.`,
          canRepair: !env.heaterRepaired,
        };

      case 'conteneur_cryo':
        return {
          title: 'CONTENEUR CRYOGÉNIQUE // SCELLÉ [COMÈTE SEREGUINE]',
          description: `Un cylindre blindé d'un mètre de haut en alliage hafnium-titane, équipé de trois sécurités cryogéniques maintenant l'intérieur à -220°C.
Une vitre de quartz laisse entrevoir des carottes de glace noire veinées d'inclusions pourpres luminescentes : des hydrocarbures prébiotiques extraterrestres d'une pureté sans précédent.
Une telle manne permettrait à la Mutuelle de produire du carburant de fusion pour toute la Ceinture... ou à Hélion d'imposer un monopole écrasant sur l'énergie solaire.`,
          canRepair: false,
        };

      case 'lina':
        return {
          title: 'LINA KOVALENKO // TECHNICIENNE DE LA MUTUELLE',
          description: `Âgée d'environ 28 ans, née sur l'habitat Vesta. Une mineure endurcie, les traits tirés par l'épuisement.
Son flanc gauche saigne abondamment à travers la perforation de sa combinaison de travail souple.
Pression de sa combinaison : critique.
Elle a besoin d'une [Rustine pneumatique] pour sceller le joint et d'un [Injecteur de coagulant] pour stopper l'hémorragie interne avant de succomber.`,
          canRepair: false,
        };

      case 'kael':
        return {
          title: 'INSPECTEUR KAEL DARROW // OFFICE DE LA VEILLE',
          description: `Officier martien assermenté. Porte l'armure de pont réglementaire grise et jaune de la Veille.
Son visage est impassible derrière sa visière blindée dorée.
Il est animé par une croyance inébranlable dans la suprématie de la loi et la prévention des risques biologiques. Bien que rigide, il respecte les textes légaux et la vie des sociétaires de la Mutuelle.`,
          canRepair: false,
        };

      case 'voronov':
        return {
          title: 'DIMITRI VORONOV // AGENT DU KOMBINAT HÉLION',
          description: `Officiellement « consultant en fret », en réalité un agent de sécurité privé d'Hélion dépêché depuis Titan.
Il porte une lourde combinaison thermique noire.
[NOTE TACTIQUE DU SAUVETEUR] : Voronov n'a PAS enclenché ses semelles magnétiques au caillebotis métallique. En microgravité (0.04g), tout tir avec son pistolet 10mm le projettera violemment en arrière par réaction !`,
          canRepair: false,
        };

      default:
        return {
          title: 'ÉLÉMENT DU SAS',
          description: 'Rien de particulier à signaler.',
          canRepair: false,
        };
    }
  };

  const content = getContent();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-xs font-mono text-xs">
      <div className="w-full max-w-lg bg-black border-2 border-current rounded shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
        <div className="flex items-center justify-between p-3 border-b-2 border-current bg-current/10">
          <span className="font-bold uppercase tracking-wider">{content.title}</span>
          <button
            onClick={onClose}
            className="px-2 py-0.5 border border-current hover:bg-current hover:text-black font-bold cursor-pointer"
          >
            [FERMER ✕]
          </button>
        </div>

        <div className="p-4 space-y-3 leading-relaxed text-[12px] whitespace-pre-line">
          {content.description}
        </div>

        <div className="p-3 border-t border-current/30 flex items-center justify-end gap-2 bg-current/5">
          {content.canRepair && onRepairAttempt && (
            <button
              onClick={() => {
                onClose();
                onRepairAttempt();
              }}
              className="px-3 py-1.5 border border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-black font-bold uppercase cursor-pointer"
            >
              [Tenter la réparation d'urgence]
            </button>
          )}
          <button
            onClick={onClose}
            className="px-3 py-1.5 border border-current hover:bg-current hover:text-black font-bold uppercase cursor-pointer"
          >
            [Retour au sas]
          </button>
        </div>
      </div>
    </div>
  );
};
