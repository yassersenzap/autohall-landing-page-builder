import { asPropString } from '@/features/builder-engine/lib/block-props';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/primitives';

type FAQItem = {
  question?: string;
  answer?: string;
};

type FAQBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

export function FAQBlockPreview({ propsJson }: FAQBlockPreviewProps) {
  const heading = asPropString(propsJson.heading) || 'Questions fréquentes';
  const rawItems = Array.isArray(propsJson.items) ? propsJson.items : [];
  const items = (rawItems as FAQItem[]).slice(0, 8);

  return (
    <section className="w-full bg-white px-6 py-16 dark:bg-neutral-950">
      <div className="mx-auto max-w-3xl">
        <h2
          className="mb-8 text-center text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {heading}
        </h2>

        {items.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {items.map((item, index) => {
              const question = item.question || `Question ${index + 1}`;
              const answer = item.answer || '';
              return (
                <AccordionItem
                  key={`faq-${index}`}
                  value={`faq-${index}`}
                  className="border-neutral-200 dark:border-neutral-800"
                >
                  <AccordionTrigger className="text-left text-sm font-medium text-neutral-900 hover:no-underline dark:text-neutral-100">
                    {question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    {answer || 'Réponse à compléter dans l’inspecteur.'}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        ) : (
          <p className="text-center text-sm text-neutral-500">Ajoutez des questions dans l’inspecteur.</p>
        )}
      </div>
    </section>
  );
}
