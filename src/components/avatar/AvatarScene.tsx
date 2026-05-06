'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Environment, OrbitControls } from '@react-three/drei';
import { Avatar } from '../Avatar';
import { GamingRoom } from '../gaming-room';

interface AvatarSceneProps {
  animation?: string;
}

function SceneContent({ animation }: AvatarSceneProps) {
  return (
    <>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2}
      />
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.4}
        castShadow
        color="#fff5e0"
      />
      <directionalLight
        position={[-4, 2, -3]}
        intensity={0.3}
        color="#8090ff"
      />
      <pointLight position={[0, 3, 3]} intensity={0.6} color="#c9a96e" />

      <Suspense fallback={null}>
        <group position={[0.45, -0.88, 0]} rotation-y={-0.82} scale={0.9}>
          <GamingRoom position={[0, 0, 0]} scale={0.13} />
          <Avatar animation={animation ?? 'Standing'} rotation-y={0.82} />
          <ContactShadows
            opacity={0.6}
            scale={10}
            blur={2}
            far={10}
            color="#050505"
          />
        </group>
        <Environment preset="city" />
      </Suspense>
    </>
  );
}

export function AvatarScene({ animation = 'Standing' }: AvatarSceneProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 1.2, 4.5], fov: 35 }}
      gl={{ alpha: true, antialias: true }}
      style={{ background: 'transparent' }}
    >
      <SceneContent animation={animation} />
    </Canvas>
  );
}
