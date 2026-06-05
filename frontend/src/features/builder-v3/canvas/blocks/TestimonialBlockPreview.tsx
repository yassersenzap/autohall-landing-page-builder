import { asPropString } from '@/features/builder-engine/lib/block-props';

type TestimonialItem = {
  quote?: string;
  author?: string;
  verified?: boolean;
};

type TestimonialBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

function StarRating() {
  return (
    <div className="flex gap-0.5" aria-label="5 étoiles sur 5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className="h-4 w-4 text-amber-400"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function TestimonialBlockPreview({ propsJson }: TestimonialBlockPreviewProps) {
  const heading = asPropString(propsJson.heading) || 'Ils nous font confiance';
  const rawItems = Array.isArray(propsJson.items) ? propsJson.items : [];
  const items = (rawItems as TestimonialItem[]).slice(0, 3);

  return (
    <section className="w-full bg-neutral-50 px-6 py-16 dark:bg-neutral-900">
      <div className="mx-auto max-w-5xl">
        <h2
          className="mb-10 text-center text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {heading}
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {items.map((item, index) => {
            const quote = item.quote || '';
            const author = item.author || `Client ${index + 1}`;
            const verified = item.verified !== false;

            return (
              <article
                key={`${author}-${index}`}
                className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
              >
                <StarRating />
                <blockquote className="mt-4 flex-1 text-sm italic leading-relaxed text-neutral-700 dark:text-neutral-300">
                  {quote ? `« ${quote} »` : 'Témoignage à compléter.'}
                </blockquote>
                <footer className="mt-6 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {author}
                  </p>
                  {verified ? (
                    <p className="mt-0.5 text-xs text-neutral-500">Acheteur vérifié</p>
                  ) : null}
                </footer>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
