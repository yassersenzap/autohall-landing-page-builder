import { IconCircleCheckFilled, IconLoader } from '@tabler/icons-react';

import { DEMO_TABLE_ROWS } from '@/ui-lab/autohall-dashboard-target/data/demo-rows';
import { Badge } from '@/ui-lab/ui/badge';
import { Button } from '@/ui-lab/ui/button';
import { Label } from '@/ui-lab/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui-lab/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui-lab/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/ui-lab/ui/tabs';

function StatusBadge({ statut }: { statut: 'Active' | 'Brouillon' }) {
  if (statut === 'Active') {
    return (
      <Badge variant="outline" className="ah-status-badge--success text-muted-foreground px-1.5">
        <IconCircleCheckFilled />
        {statut}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="ah-status-badge--pending text-muted-foreground px-1.5">
      <IconLoader />
      {statut}
    </Badge>
  );
}

function CampaignTable() {
  return (
    <div className="ah-target-table overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campagne</TableHead>
            <TableHead>Landing page</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Version</TableHead>
            <TableHead className="text-right">Leads</TableHead>
            <TableHead>Dernier export</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {DEMO_TABLE_ROWS.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.campagne}</TableCell>
              <TableCell>{row.landing}</TableCell>
              <TableCell>
                <StatusBadge statut={row.statut} />
              </TableCell>
              <TableCell className="text-muted-foreground">{row.version}</TableCell>
              <TableCell className="text-right tabular-nums">{row.leads}</TableCell>
              <TableCell className="text-muted-foreground">{row.dernierExport}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="ah-cta-studio h-8"
                    disabled
                  >
                    Studio
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="h-8" disabled>
                    Aperçu
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="h-8" disabled>
                    Export
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function AutoHallTargetTable() {
  return (
    <Tabs defaultValue="campagnes" className="ah-target-tabs w-full flex-col justify-start gap-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="ah-target-view" className="sr-only">
          Vue
        </Label>
        <Select defaultValue="campagnes">
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            size="sm"
            id="ah-target-view"
          >
            <SelectValue placeholder="Campagnes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="campagnes">Campagnes</SelectItem>
            <SelectItem value="landing-pages">Landing pages</SelectItem>
            <SelectItem value="exports">Exports</SelectItem>
            <SelectItem value="leads">Leads</SelectItem>
          </SelectContent>
        </Select>
        <TabsList className="hidden @4xl/main:flex">
          <TabsTrigger value="campagnes">Campagnes</TabsTrigger>
          <TabsTrigger value="landing-pages">Landing pages</TabsTrigger>
          <TabsTrigger value="exports">Exports</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent
        value="campagnes"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <CampaignTable />
      </TabsContent>
      <TabsContent
        value="landing-pages"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <CampaignTable />
      </TabsContent>
      <TabsContent
        value="exports"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <CampaignTable />
      </TabsContent>
      <TabsContent
        value="leads"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <CampaignTable />
      </TabsContent>
    </Tabs>
  );
}
