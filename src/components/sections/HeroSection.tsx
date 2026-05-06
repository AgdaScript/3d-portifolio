import { HERO_CONFIG } from '@/config/hero.config';
import { AvatarCanvas } from '@/components/hero/AvatarCanvas';
import { HeroContent } from '@/components/hero/HeroContent';

export function HeroSection() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-background">
      <BackgroundGradient />

      {/* Avatar scene (same container, aligned to the right) */}
      <div className="absolute inset-0 z-0 flex justify-end">
        <div className="h-full w-[70%]">
          <AvatarCanvas animation={HERO_CONFIG.avatar.animation} />
        </div>
      </div>

      {/* Text over the scene */}
      <div className="relative z-10 h-full w-full">
        <div className="h-full max-w-[30%]">
          <HeroContent config={HERO_CONFIG} />
        </div>
      </div>
    </section>
  );
}

function BackgroundGradient() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        background:
          'radial-gradient(ellipse at 70% 40%, #16142a 0%, #080808 55%)',
      }}
    />
  );
}
