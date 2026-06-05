import { cn } from '@/lib/utils';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

type LeadAvatarProps = {
  name: string;
  className?: string;
};

/** Avatar initiales pour la colonne contact du CRM leads. */
export function LeadAvatar({ name, className }: LeadAvatarProps) {
  return (
    <div
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-sm font-semibold text-blue-400 ring-1 ring-blue-500/25',
        className,
      )}
      aria-hidden
    >
      {getInitials(name)}
    </div>
  );
}
