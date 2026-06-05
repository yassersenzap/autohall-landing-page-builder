import type { ReactNode } from 'react';
import { AppShell } from '@/design-system';

type StudioShellProps = {
  children: ReactNode;
};

/** Application shell — delegates to design-system AppShell */
export default function StudioShell({ children }: StudioShellProps) {
  return <AppShell>{children}</AppShell>;
}
