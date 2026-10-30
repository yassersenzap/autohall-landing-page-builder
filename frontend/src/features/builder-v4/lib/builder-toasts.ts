import { toast } from 'sonner';

export const builderToast = {
  copied: () => toast.success('Copié'),
  pasted: () => toast.success('Collé'),
  deleted: (count = 1, onUndo?: () => void) => {
    if (onUndo) {
      toast.success(count > 1 ? `${count} éléments supprimés` : 'Hero + Form supprimé', {
        description: 'Ctrl+Z pour annuler',
        action: { label: 'Annuler', onClick: onUndo },
        duration: 8000,
      });
      return;
    }
    toast.success(count > 1 ? `${count} éléments supprimés` : 'Supprimé');
  },
  duplicated: (count = 1) => toast.success(count > 1 ? `${count} éléments dupliqués` : 'Dupliqué'),
  undo: () => toast('Annulé', { description: 'Document restauré' }),
  redo: () => toast('Rétabli', { description: 'Modification réappliquée' }),
};
