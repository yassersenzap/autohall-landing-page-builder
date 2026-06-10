import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import { buildLeadChartSeries } from '@/ui-lab/autohall-dashboard-target/data/chart-data';
import { useIsMobile } from '@/ui-lab/hooks/use-mobile';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/ui-lab/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/ui-lab/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui-lab/ui/select';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/ui-lab/ui/toggle-group';

const FULL_SERIES = buildLeadChartSeries(90);

const chartConfig = {
  leads: {
    label: 'Leads',
  },
  submissions: {
    label: 'Soumissions',
    color: 'var(--ah-chart-stroke)',
  },
  contactes: {
    label: 'Contactés',
    color: 'var(--ah-chart-stroke-muted)',
  },
} satisfies ChartConfig;

const RANGE_LABELS: Record<string, string> = {
  '90d': 'Volume des soumissions sur les 3 derniers mois',
  '30d': 'Volume des soumissions sur les 30 derniers jours',
  '7d': 'Volume des soumissions sur les 7 derniers jours',
};

function filterSeries(timeRange: string) {
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  return FULL_SERIES.slice(-days);
}

export function AutoHallTargetChart() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState('30d');

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange('7d');
    }
  }, [isMobile]);

  const filteredData = filterSeries(timeRange);

  return (
    <Card className="ah-target-panel-card @container/card">
      <CardHeader>
        <CardTitle>Performance leads</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            {RANGE_LABELS[timeRange]}
          </span>
          <span className="@[540px]/card:hidden">
            {timeRange === '90d' ? '3 mois' : timeRange === '30d' ? '30 jours' : '7 jours'}
          </span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(value) => value && setTimeRange(value)}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">3 mois</ToggleGroupItem>
            <ToggleGroupItem value="30d">30 jours</ToggleGroupItem>
            <ToggleGroupItem value="7d">7 jours</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Période"
            >
              <SelectValue placeholder="30 jours" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                3 mois
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                30 jours
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                7 jours
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="ahTargetFillSubmissions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-submissions)" stopOpacity={0.9} />
                <stop offset="95%" stopColor="var(--color-submissions)" stopOpacity={0.08} />
              </linearGradient>
              <linearGradient id="ahTargetFillContactes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-contactes)" stopOpacity={0.65} />
                <stop offset="95%" stopColor="var(--color-contactes)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('fr-FR', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString('fr-FR', {
                      month: 'short',
                      day: 'numeric',
                    })
                  }
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="contactes"
              type="natural"
              fill="url(#ahTargetFillContactes)"
              stroke="var(--color-contactes)"
              stackId="a"
            />
            <Area
              dataKey="submissions"
              type="natural"
              fill="url(#ahTargetFillSubmissions)"
              stroke="var(--color-submissions)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
