import type { ReactNode } from 'react';
import { AutoHallAdminShell } from '@/components/admin';

type StudioShellProps = {
  children: ReactNode;
};

/** Application shell — dashboard-01 visual system with Auto Hall navigation */
export default function StudioShell({ children }: StudioShellProps) {
  return <AutoHallAdminShell>{children}</AutoHallAdminShell>;
}
