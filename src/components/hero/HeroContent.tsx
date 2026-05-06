import Link from 'next/link';
import type { HeroConfig } from '@/config/hero.config';

interface HeroContentProps {
  config: HeroConfig;
}

export function HeroContent({ config }: HeroContentProps) {
  const { label, name, role, description, cta } = config;

  return (
    <div className="flex flex-col justify-center gap-8 px-12 py-16 lg:px-16 xl:px-20">
      <Label text={label} />
      <HeroName first={name.first} last={name.last} />
      <Divider />
      <HeroBody role={role} description={description} />
      <HeroActions cta={cta} />
    </div>
  );
}

function Label({ text }: { text: string }) {
  return (
    <div
      className="flex items-center gap-3 opacity-0 animate-fade-in"
      style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
    >
      <span className="h-px w-6 bg-accent" />
      <span className="font-body text-xs font-medium uppercase tracking-[0.25em] text-accent">
        {text}
      </span>
    </div>
  );
}

function HeroName({ first, last }: { first: string; last: string }) {
  return (
    <h1
      className="font-display text-[5.5rem] font-light leading-[0.92] tracking-[-0.02em] text-foreground opacity-0 animate-fade-up md:text-[7rem] lg:text-[8.5rem] xl:text-[10rem]"
      style={{ animationDelay: '0.25s', animationFillMode: 'forwards' }}
    >
      <span className="block">{first}</span>
      <span className="block">{last}</span>
    </h1>
  );
}

function Divider() {
  return (
    <div
      className="overflow-hidden opacity-0 animate-fade-in"
      style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}
    >
      <div className="h-px w-full bg-accent/50 animate-line-grow" />
    </div>
  );
}

function HeroBody({
  role,
  description,
}: {
  role: string;
  description: string;
}) {
  return (
    <div
      className="flex flex-col gap-3 opacity-0 animate-fade-up"
      style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}
    >
      <p className="font-body text-lg font-medium text-foreground/90">{role}</p>
      <p className="font-body max-w-sm text-sm leading-relaxed text-muted">
        {description}
      </p>
    </div>
  );
}

function HeroActions({ cta }: { cta: HeroConfig['cta'] }) {
  return (
    <div
      className="flex flex-wrap items-center gap-4 opacity-0 animate-fade-up"
      style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}
    >
      <Link
        href={cta.primary.href}
        className="rounded-full bg-accent px-7 py-3 font-body text-sm font-medium text-background transition-all hover:bg-accent/90 hover:scale-105 active:scale-95"
      >
        {cta.primary.label}
      </Link>
      <Link
        href={cta.secondary.href}
        className="rounded-full border border-foreground/20 px-7 py-3 font-body text-sm font-medium text-foreground/80 transition-all hover:border-foreground/40 hover:text-foreground hover:scale-105 active:scale-95"
      >
        {cta.secondary.label}
      </Link>
    </div>
  );
}
