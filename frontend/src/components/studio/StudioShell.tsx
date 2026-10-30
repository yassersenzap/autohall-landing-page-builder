import type { ReactNode } from 'react';
import { AutoHallAdminShell } from '@/components/admin';

type StudioShellProps = {
  children: ReactNode;
};

/** Application shell — Auto Hall admin navigation and layout */
export default function StudioShell({ children }: StudioShellProps) {
  return <AutoHallAdminShell>{children}</AutoHallAdminShell>;
}
