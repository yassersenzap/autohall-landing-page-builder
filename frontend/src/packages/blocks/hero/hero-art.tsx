import { motion } from 'framer-motion';
import type { V4BlockRenderProps } from '../shared/types';
import { V4Section } from '../shared/section';
import { resolveImageSrc } from '../shared/media';
import { str } from '../shared/props';

export function HeroArtRender({ propsJson }: V4BlockRenderProps) {
  const title = str(propsJson, 'title', 'Bringing Art to everything');
  const img = resolveImageSrc(propsJson);

  const bgUrl = img ? `url(${img})` : 'none';
  const fallbackBg = !img ? 'linear-gradient(135deg, #1e293b 0%, #312e81 100%)' : 'none';
  const overlay = 'linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.3) 50%, rgba(0, 0, 0, 0) 100%)';
  const backgroundStyle = img
    ? `${overlay}, ${bgUrl}`
    : `${overlay}, ${fallbackBg}`;

  return (
    <V4Section blockType="hero_art" className="px-4 sm:px-6 lg:px-8 py-4 w-full">
      <motion.div
        className="h-120 md:h-[80dvh] flex flex-col bg-cover bg-center bg-no-repeat rounded-2xl relative overflow-hidden w-full"
        style={{
          backgroundImage: backgroundStyle,
          minHeight: '400px',
        }}
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="mt-auto w-2/3 md:max-w-lg ps-5 pb-5 md:ps-10 md:pb-10 z-10">
          <h1 className="text-xl md:text-3xl lg:text-5xl text-white font-bold leading-tight tracking-tight">
            {title}
          </h1>
        </div>
      </motion.div>
    </V4Section>
  );
}
