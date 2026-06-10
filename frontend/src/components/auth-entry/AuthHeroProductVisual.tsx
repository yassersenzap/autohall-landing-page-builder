import { motion, useReducedMotion } from 'framer-motion';
import { useCallback, useState, type PointerEvent } from 'react';
import logoSrc from '@/assets/brand/logo-autohall-header.svg';

const INSPECTOR_ROWS = [0.72, 0.48, 0.86] as const;
const COLOR_CHIPS = ['#3a3a40', '#4a4a50', '#5c1a20', '#ececef'] as const;

export function AuthHeroProductVisual() {
  const reduceMotion = useReducedMotion();
  const [tilt, setTilt] = useState({ rx: 6, ry: -10 });

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (reduceMotion) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      setTilt({ rx: 6 + py * 5, ry: -10 + px * 8 });
    },
    [reduceMotion],
  );

  const resetTilt = useCallback(() => {
    setTilt({ rx: 6, ry: -10 });
  }, []);

  return (
    <motion.div
      className="auth-hero-product"
      aria-hidden
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
    >
      <div className="auth-hero-product__grid-fade" />

      <motion.div
        className="auth-hero-product__stage"
        style={{
          rotateX: tilt.rx,
          rotateY: tilt.ry,
          transformPerspective: 1200,
        }}
        animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
        transition={reduceMotion ? undefined : { duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <aside className="auth-hero-product__inspector">
          <span className="auth-hero-product__micro">Preview</span>
          <div className="auth-hero-product__inspector-rows">
            {INSPECTOR_ROWS.map((fill, index) => (
              <div key={index} className="auth-hero-product__slider">
                <span className="auth-hero-product__slider-fill" style={{ width: `${fill * 100}%` }} />
              </div>
            ))}
          </div>
          <div className="auth-hero-product__chips">
            {COLOR_CHIPS.map((color) => (
              <span key={color} className="auth-hero-product__chip" style={{ background: color }} />
            ))}
          </div>
          <div className="auth-hero-product__inspector-toggle">
            <span />
          </div>
        </aside>

        <div className="auth-hero-product__canvas">
          <header className="auth-hero-product__toolbar">
            <div className="auth-hero-product__traffic">
              <span />
              <span />
              <span />
            </div>
            <div className="auth-hero-product__url" />
            <span className="auth-hero-product__draft-pill">Draft</span>
          </header>

          <div className="auth-hero-product__mark">
            <img src={logoSrc} alt="" className="auth-hero-product__mark-logo" decoding="async" />
          </div>

          <div className="auth-hero-product__viewport">
            <div className="auth-hero-product__lp-grid">
              <div className="auth-hero-product__lp-copy">
                <span className="auth-hero-product__bar auth-hero-product__bar--lg" />
                <span className="auth-hero-product__bar auth-hero-product__bar--md" />
                <span className="auth-hero-product__bar auth-hero-product__bar--sm" />
                <span className="auth-hero-product__pill" />
              </div>
              <div className="auth-hero-product__lp-aside">
                <span className="auth-hero-product__media" />
                <div className="auth-hero-product__form">
                  <span className="auth-hero-product__bar auth-hero-product__bar--xs" />
                  <span className="auth-hero-product__field" />
                  <span className="auth-hero-product__field" />
                  <span className="auth-hero-product__field auth-hero-product__field--short" />
                </div>
              </div>
            </div>
          </div>

          <svg className="auth-hero-product__lead-line" viewBox="0 0 80 48" fill="none" aria-hidden>
            <path
              d="M8 40 C 28 40, 36 24, 52 16"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.45"
            />
            <circle cx="56" cy="14" r="2.5" fill="currentColor" />
          </svg>
        </div>

        <div className="auth-hero-product__export">
          <span className="auth-hero-product__export-dot" aria-hidden />
          <span className="auth-hero-product__micro">Export</span>
        </div>

        <div className="auth-hero-product__phone">
          <div className="auth-hero-product__phone-notch" />
          <div className="auth-hero-product__phone-screen">
            <span className="auth-hero-product__bar auth-hero-product__bar--xs" />
            <span className="auth-hero-product__media auth-hero-product__media--sm" />
            <span className="auth-hero-product__pill auth-hero-product__pill--sm" />
            <span className="auth-hero-product__field auth-hero-product__field--sm" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
