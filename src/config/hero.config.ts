export const HERO_CONFIG = {
  label: 'Portfolio',
  name: {
    first: 'Agda',
    last: 'Lopes',
  },
  role: 'Developer & Designer',
  description:
    'Apaixonada por criar experiências digitais únicas. Especialista em interfaces modernas e soluções criativas.',
  cta: {
    primary: {
      label: 'Ver Projetos',
      href: '#projects',
    },
    secondary: {
      label: 'Contacto',
      href: '#contact',
    },
  },
  avatar: {
    animation: 'Standing' as const,
  },
} as const;

export type HeroConfig = typeof HERO_CONFIG;
