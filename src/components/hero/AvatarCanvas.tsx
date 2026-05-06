'use client';

import dynamic from 'next/dynamic';

const AvatarScene = dynamic(
  () => import('@/components/avatar/AvatarScene').then((m) => m.AvatarScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <span className="h-1 w-16 animate-pulse rounded-full bg-accent/40" />
      </div>
    ),
  }
);

interface AvatarCanvasProps {
  animation?: string;
}

export function AvatarCanvas({ animation = 'Standing' }: AvatarCanvasProps) {
  return (
    <div className="relative h-full w-full">
      <AvatarScene animation={animation} />
    </div>
  );
}
