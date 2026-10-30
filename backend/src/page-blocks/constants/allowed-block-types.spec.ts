import { ALLOWED_BLOCK_TYPES, V4_BLOCK_TYPES } from './allowed-block-types';

describe('ALLOWED_BLOCK_TYPES', () => {
  it('includes all V4 block types', () => {
    for (const type of V4_BLOCK_TYPES) {
      expect(ALLOWED_BLOCK_TYPES).toContain(type);
    }
  });

  it('includes legacy core campaign block', () => {
    expect(ALLOWED_BLOCK_TYPES).toContain('core_campaign_form_landing');
  });
});
