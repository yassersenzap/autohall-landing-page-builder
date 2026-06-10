export type LeadChartPoint = {
  date: string;
  submissions: number;
  contactes: number;
};

/** Deterministic placeholder series for the last N days */
export function buildLeadChartSeries(dayCount: number): LeadChartPoint[] {
  const end = new Date('2026-06-05');
  return Array.from({ length: dayCount }, (_, index) => {
    const date = new Date(end);
    date.setDate(end.getDate() - (dayCount - 1 - index));
    const wave = Math.sin(index / 2.8) * 9 + Math.cos(index / 5.1) * 5;
    const submissions = Math.max(0, Math.round(14 + wave + (index % 7)));
    const contactes = Math.max(0, Math.round(submissions * 0.32 + Math.sin(index / 4) * 2));
    return {
      date: date.toISOString().slice(0, 10),
      submissions,
      contactes,
    };
  });
}
