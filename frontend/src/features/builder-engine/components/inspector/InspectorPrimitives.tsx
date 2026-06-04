import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/primitives/accordion';
import { ShadInput, ShadTextarea } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';

const inputCompact =
  'h-8 text-sm shadow-none focus-visible:ring-1';
type InspectorAccordionProps = {
  /** Remonte l’état à chaque changement de bloc (key sur le parent). */
  defaultValue: string[];
  children: ReactNode;
};

export function InspectorAccordion({ defaultValue, children }: InspectorAccordionProps) {
  return (
    <Accordion
      type="multiple"
      defaultValue={defaultValue}
      className="w-full rounded-md border border-border/80 bg-muted/20 px-1"
    >
      {children}
    </Accordion>
  );
}

export function InspectorSection({
  value,
  title,
  children,
}: {
  value: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <AccordionItem value={value} className="px-2">
      <AccordionTrigger className="py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:no-underline">
        {title}
      </AccordionTrigger>
      <AccordionContent>
        <div className="grid gap-3">{children}</div>
      </AccordionContent>
    </AccordionItem>
  );
}

export function InspectorInput({
  label,
  hint,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <ShadInput
      label={label}
      hint={hint}
      className={cn(inputCompact, className)}
      {...props}
    />
  );
}

export function InspectorTextarea({
  label,
  rows = 2,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <div className="grid gap-1.5">
      <ShadTextarea
        label={label}
        rows={rows}
        className={cn('min-h-0 resize-y text-sm shadow-none focus-visible:ring-1', className)}
        {...props}
      />
    </div>
  );
}
