import { LeadPriority } from '@prisma/client';

const PRIORITY_LABELS: Record<LeadPriority, string> = {
  LOW: 'Basse',
  NORMAL: 'Normale',
  HIGH: 'Haute',
  URGENT: 'Urgente',
};

export function formatPriorityLabel(priority: LeadPriority): string {
  return PRIORITY_LABELS[priority];
}

export function formatFollowUpDate(value: Date | null): string {
  if (!value) {
    return 'Non planifiée';
  }
  return value.toLocaleString('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export function buildFollowUpActivityNote(changes: string[]): string {
  return changes.join('\n');
}
