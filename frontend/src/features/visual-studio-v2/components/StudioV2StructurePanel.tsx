import { useMemo } from 'react';
import { usePuck } from '@puckeditor/core';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { flattenDocumentStructure } from '../lib/walk-structure';
import { studioV2PuckConfig } from '../puck-config/index';

export function StudioV2StructurePanel() {
  const { appState, dispatch, getSelectorForId, selectedItem } = usePuck();
  const selectedId =
    selectedItem?.props?.id && typeof selectedItem.props.id === 'string'
      ? selectedItem.props.id
      : null;

  const nodes = useMemo(
    () => flattenDocumentStructure(appState.data, studioV2PuckConfig),
    [appState.data],
  );

  function handleSelect(node: (typeof nodes)[number]) {
    const selector = getSelectorForId(node.id);
    if (selector) {
      dispatch({ type: 'setUi', ui: { itemSelector: selector } });
      return;
    }
    dispatch({
      type: 'setUi',
      ui: { itemSelector: { index: node.index, zone: node.zone } },
    });
  }

  if (nodes.length === 0) {
    return (
      <div className="vs2-structure-panel">
        <p className="vs2-structure-panel__empty">Aucun bloc sur la page.</p>
      </div>
    );
  }

  return (
    <div className="vs2-structure-panel">
      <p className="vs2-structure-panel__title">Structure de la page</p>
      <ul className="vs2-structure-panel__list">
        {nodes.map((node) => (
          <li key={`${node.zone}-${node.index}-${node.id}`}>
            <button
              type="button"
              className={cn('vs2-structure-panel__item', selectedId === node.id && 'is-selected')}
              style={{ paddingLeft: `${0.65 + node.depth * 0.85}rem` }}
              onClick={() => handleSelect(node)}
            >
              <ChevronRight className="vs2-structure-panel__chevron" aria-hidden />
              <span className="vs2-structure-panel__label">{node.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
