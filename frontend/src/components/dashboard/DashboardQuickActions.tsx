import { IconLayoutGrid, IconPlus, IconUsers } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

import { ADMIN_CONTENT_PAD } from '@/components/admin/admin-layout';
import { Button } from '@/components/ui/shadcn/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/shadcn/card';

type DashboardQuickActionsProps = {
  showLeads: boolean;
};

export function DashboardQuickActions({ showLeads }: DashboardQuickActionsProps) {
  return (
    <div className={ADMIN_CONTENT_PAD}>
      <Card>
        <CardHeader>
          <CardTitle>Raccourcis</CardTitle>
          <CardDescription>Actions fréquentes du studio.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button asChild variant="outline" size="sm" className="justify-start">
            <Link to="/campaigns">
              <IconPlus className="size-4" />
              Créer une campagne
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="justify-start">
            <Link to="/campaigns">
              <IconLayoutGrid className="size-4" />
              Campagnes
            </Link>
          </Button>
          {showLeads ? (
            <Button asChild variant="outline" size="sm" className="justify-start">
              <Link to="/leads">
                <IconUsers className="size-4" />
                Leads
              </Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
