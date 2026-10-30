import { BadRequestException } from '@nestjs/common';
import { extractExtension, validateUploadFile } from './asset-upload.policy';

describe('asset-upload.policy', () => {
  const maxBytes = 5_242_880;

  it('accepts a valid png upload', () => {
    expect(() =>
      validateUploadFile(
        {
          originalname: 'hero.png',
          mimetype: 'image/png',
          size: 1024,
        },
        maxBytes,
      ),
    ).not.toThrow();
  });

  it('rejects forbidden extensions', () => {
    expect(() =>
      validateUploadFile(
        {
          originalname: 'shell.php',
          mimetype: 'image/png',
          size: 100,
        },
        maxBytes,
      ),
    ).toThrow(BadRequestException);
  });

  it('rejects disallowed mime types', () => {
    expect(() =>
      validateUploadFile(
        {
          originalname: 'photo.jpg',
          mimetype: 'application/javascript',
          size: 100,
        },
        maxBytes,
      ),
    ).toThrow(BadRequestException);
  });

  it('extracts extension from nested path', () => {
    expect(extractExtension('C:\\uploads\\car.webp')).toBe('webp');
  });
});
