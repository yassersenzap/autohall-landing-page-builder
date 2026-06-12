import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MediaFieldControl } from './MediaFieldControl';

vi.mock('@/features/builder-engine/hooks/use-page-assets', () => ({
  usePageAssets: () => ({ assets: [], uploading: false, upload: vi.fn() }),
}));

vi.mock('@/features/builder-engine/store/builder-document.store', () => ({
  getBuilderPersistPageVersionId: () => 'pv-1',
}));

describe('FocalPointPicker via MediaFieldControl', () => {
  it('renders focal picker when image exists and cover cropping is active', () => {
    render(
      <MediaFieldControl
        label="Hero"
        value={{ imageUrl: 'https://cdn.example.com/hero.jpg', objectFit: 'cover' }}
        onChange={() => {}}
        showFocalPicker
        focalPoint={{ x: 50, y: 50 }}
        onFocalChange={() => {}}
      />,
    );

    expect(screen.getByTestId('focal-point-picker')).toBeInTheDocument();
    expect(screen.getByTestId('focal-point-marker')).toBeInTheDocument();
    expect(screen.getByText('Point focal')).toBeInTheDocument();
    expect(screen.getByLabelText('Horizontal')).toBeInTheDocument();
    expect(screen.getByLabelText('Vertical')).toBeInTheDocument();
  });

  it('does not render broken focal UI when image is missing', () => {
    render(
      <MediaFieldControl
        label="Hero"
        value={{ imageUrl: '', objectFit: 'cover' }}
        onChange={() => {}}
        showFocalPicker
        focalPoint={{ x: 50, y: 50 }}
        onFocalChange={() => {}}
      />,
    );

    expect(screen.queryByTestId('focal-point-picker')).not.toBeInTheDocument();
    expect(screen.queryByTestId('focal-point-fields')).not.toBeInTheDocument();
    expect(screen.getByTestId('media-field-empty')).toBeInTheDocument();
  });

  it('click on focal picker emits clamped focalPointX/Y patch', () => {
    const onFocalChange = vi.fn();
    render(
      <MediaFieldControl
        label="Hero"
        value={{ imageUrl: 'https://cdn.example.com/hero.jpg', objectFit: 'cover' }}
        onChange={() => {}}
        showFocalPicker
        focalPoint={{ x: 50, y: 50 }}
        onFocalChange={onFocalChange}
      />,
    );

    const picker = screen.getByTestId('focal-point-picker');
    picker.getBoundingClientRect = () =>
      ({
        left: 0,
        top: 0,
        width: 200,
        height: 100,
        right: 200,
        bottom: 100,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;

    fireEvent.pointerDown(picker, { clientX: 180, clientY: 90, pointerId: 1 });

    expect(onFocalChange).toHaveBeenCalled();
    const [x, y] = onFocalChange.mock.calls[0];
    expect(x).toBeGreaterThanOrEqual(0);
    expect(x).toBeLessThanOrEqual(100);
    expect(y).toBeGreaterThanOrEqual(0);
    expect(y).toBeLessThanOrEqual(100);
  });

  it('clamps focal numeric inputs to 0–100', () => {
    const onFocalChange = vi.fn();
    render(
      <MediaFieldControl
        label="Hero"
        value={{ imageUrl: 'https://cdn.example.com/hero.jpg', objectFit: 'cover' }}
        onChange={() => {}}
        showFocalPicker
        focalPoint={{ x: 50, y: 50 }}
        onFocalChange={onFocalChange}
      />,
    );

    fireEvent.change(screen.getByLabelText('Horizontal'), { target: { value: '150' } });
    expect(onFocalChange).toHaveBeenLastCalledWith(100, 50);

    fireEvent.change(screen.getByLabelText('Vertical'), { target: { value: '-10' } });
    expect(onFocalChange).toHaveBeenLastCalledWith(50, 0);
  });
});
