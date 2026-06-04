import type { ReactNode } from 'react';
import { Separator } from '@/components/ui/primitives';

type InspectorFieldGroupProps = {
  title: string;
  children: ReactNode;
  showSeparator?: boolean;
};

export function InspectorFieldGroup({
  title,
  children,
  showSeparator = true,
}: InspectorFieldGroupProps) {
  return (
    <section className="space-y-3">
      {showSeparator ? <Separator /> : null}
      <h3 className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
