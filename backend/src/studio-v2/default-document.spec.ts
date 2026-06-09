import { describe, expect, it } from '@jest/globals';
import {
  buildDefaultStudioV2Document,
  STUDIO_V2_ENGINE,
} from './default-document';

describe('buildDefaultStudioV2Document', () => {
  it('uses puck engine constant', () => {
    expect(STUDIO_V2_ENGINE).toBe('puck');
  });

  it('builds nested section > container > columns structure with puck ids', () => {
    const doc = buildDefaultStudioV2Document();
    expect(Array.isArray(doc.content)).toBe(true);
    const section = (
      doc.content as Array<{ type: string; props: { id?: string } }>
    )[0];
    expect(section?.type).toBe('Section');
    expect(section?.props.id).toBeTruthy();
    expect(doc.root).toBeTruthy();
  });

  it('includes hero and lead form in default columns', () => {
    const doc = buildDefaultStudioV2Document();
    const sectionProps = (
      doc.content as Array<{ props: Record<string, unknown> }>
    )[0].props;
    const container = (
      sectionProps.items as Array<{ props: Record<string, unknown> }>
    )[0];
    const columns = (
      container.props.items as Array<{ props: Record<string, unknown> }>
    )[0];
    const left = columns.props.left as Array<{ type: string }>;
    const right = columns.props.right as Array<{ type: string }>;
    expect(left[0]?.type).toBe('HeroAutoHall');
    expect(right[0]?.type).toBe('LeadFormAutoHall');
  });
});
