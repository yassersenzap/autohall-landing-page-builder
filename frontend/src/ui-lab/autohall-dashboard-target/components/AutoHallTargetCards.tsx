import { Badge } from '@/ui-lab/ui/badge';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/ui-lab/ui/card';

const METRICS = [
  {
    title: 'Session Studio',
    value: 'Active',
    caption: 'Version prête pour édition',
    badge: 'v1 — 1',
  },
  {
    title: 'Leads totaux',
    value: '0',
    caption: 'Tous statuts confondus',
    badge: '+0%',
  },
  {
    title: 'Taux de contact',
    value: '0 %',
    caption: 'Pipeline contacté',
    badge: 'Stable',
  },
  {
    title: 'Relances en retard',
    value: '0',
    caption: 'Suivi commercial',
    badge: 'À traiter',
  },
] as const;

export function AutoHallTargetCards() {
  return (
    <div className="ah-target-metric-grid grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {METRICS.map((metric) => (
        <Card key={metric.title} className="@container/card">
          <CardHeader>
            <CardDescription>{metric.title}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {metric.value}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">{metric.badge}</Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">
            {metric.caption}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
