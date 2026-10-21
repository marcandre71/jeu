/**
 * Modale d'Inventaire et d'Équipement
 */

import React from 'react';
import { InventoryItem } from '../types/game';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  onUseItem: (item: InventoryItem) => void;
  isCombat: boolean;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  inventory,
  onUseItem,
  isCombat,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-xs font-mono text-xs">
      <div className="w-full max-w-lg bg-black border-2 border-current rounded shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
        <div className="flex items-center justify-between p-3 border-b-2 border-current bg-current/10">
          <span className="font-bold uppercase tracking-wider">
            HARNAIS ET SAC D'URGENCE DU SAUVETEUR
          </span>
          <button
            onClick={onClose}
            className="px-2 py-0.5 border border-current hover:bg-current hover:text-black font-bold cursor-pointer"
          >
            [FERMER ✕]
          </button>
        </div>

        <div className="p-3 divide-y divide-current/25 max-h-[60vh] overflow-y-auto">
          {inventory.map((item) => (
            <div key={item.id} className="py-2.5 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="font-bold flex items-center gap-2">
                  <span>{item.name}</span>
                  <span className="text-[10px] px-1 border border-current/40 rounded">
                    Qté: {item.quantity}
                  </span>
                </div>
                <p className="text-[11px] opacity-75">{item.description}</p>
              </div>

              {item.useEffect && item.quantity > 0 && (
                <button
                  onClick={() => onUseItem(item)}
                  className="px-2.5 py-1.5 border border-current hover:bg-current hover:text-black font-bold text-xs uppercase cursor-pointer whitespace-nowrap self-center"
                >
                  {item.id === 'rustine' ? 'Colmater' : item.id === 'medkit' ? 'Injecter' : 'Utiliser'}
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="p-2 border-t border-current/30 text-[10px] opacity-75 text-center bg-current/5">
          {isCombat ? 'Utiliser un objet coûte 3 à 4 Points d\'Action (PA) en combat.' : 'Les objets consommables sont limités.'}
        </div>
      </div>
    </div>
  );
};
