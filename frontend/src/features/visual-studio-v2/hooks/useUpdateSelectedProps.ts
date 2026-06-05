import { useCallback } from 'react';
import { usePuck } from '@puckeditor/core';

export function useUpdateSelectedProps() {
  const { selectedItem, dispatch, getSelectorForId } = usePuck();

  return useCallback(
    (patch: Record<string, unknown>) => {
      if (!selectedItem) return;
      const id = selectedItem.props?.id;
      if (typeof id !== 'string') return;
      const selector = getSelectorForId(id);
      if (!selector) return;

      dispatch({
        type: 'replace',
        data: {
          ...selectedItem,
          props: { ...selectedItem.props, ...patch },
        },
        destinationIndex: selector.index,
        destinationZone: selector.zone,
      });
    },
    [dispatch, getSelectorForId, selectedItem],
  );
}
