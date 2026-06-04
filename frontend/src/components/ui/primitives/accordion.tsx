import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import type { ComponentPropsWithoutRef, ElementRef, Ref } from 'react';
import { cn } from '@/lib/utils';

const Accordion = AccordionPrimitive.Root;

const AccordionItem = ({
  className,
  ref,
  ...props
}: ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> & {
  ref?: Ref<ElementRef<typeof AccordionPrimitive.Item>>;
}) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn('border-b border-border last:border-b-0', className)}
    {...props}
  />
);

const AccordionTrigger = ({
  className,
  children,
  ref,
  ...props
}: ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> & {
  ref?: Ref<ElementRef<typeof AccordionPrimitive.Trigger>>;
}) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex flex-1 items-center justify-between py-2.5 text-left text-sm font-medium transition-all',
        'hover:text-foreground [&[data-state=open]>svg]:rotate-180',
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
);

const AccordionContent = ({
  className,
  children,
  ref,
  ...props
}: ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> & {
  ref?: Ref<ElementRef<typeof AccordionPrimitive.Content>>;
}) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn('overflow-hidden text-sm', className)}
    {...props}
  >
    <div className="pb-3 pt-0">{children}</div>
  </AccordionPrimitive.Content>
);

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
