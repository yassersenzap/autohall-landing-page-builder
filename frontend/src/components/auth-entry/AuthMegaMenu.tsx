import { motion, useReducedMotion } from 'framer-motion';

const ITEMS = [
  { title: 'Studio campagne', description: 'Structurez vos pages marketing', href: '#flux' },
  { title: 'Validation', description: 'Prévisualisez avant publication', href: '#flux' },
  { title: 'Publication', description: 'Préparez des exports propres', href: '#plateforme' },
  { title: 'Suivi commercial', description: 'Reliez les leads aux campagnes', href: '#plateforme' },
  { title: 'Versions', description: 'Historique des brouillons', href: '#flux' },
  { title: 'Accès sécurisé', description: 'Espace contrôlé Auto Hall', href: '#acces' },
] as const;

type AuthMegaMenuProps = {
  open: boolean;
  onClose: () => void;
};

export function AuthMegaMenu({ open, onClose }: AuthMegaMenuProps) {
  const reduceMotion = useReducedMotion();
  if (!open) return null;

  return (
    <motion.div
      className="auth-entry-mega"
      role="menu"
      aria-label="Menu Produit"
      initial={reduceMotion ? false : { opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
      transition={{ duration: 0.18 }}
    >
      <div className="auth-entry-mega__grid">
        {ITEMS.map((item) => (
          <a key={item.title} href={item.href} className="auth-entry-mega__item" role="menuitem" onClick={onClose}>
            <span className="auth-entry-mega__item-title">{item.title}</span>
            <span className="auth-entry-mega__item-desc">{item.description}</span>
          </a>
        ))}
      </div>
    </motion.div>
  );
}
