import React, { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function GamingRoom({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  ...props
}) {
  const { scene } = useLoader(GLTFLoader, 'models/modern_gaming_setup.glb');
  const roomScene = useMemo(() => scene.clone(true), [scene]);

  return (
    <group
      {...props}
      position={position}
      rotation={rotation}
      scale={scale}
      dispose={null}
    >
      <primitive object={roomScene} />
    </group>
  );
}

useLoader.preload(GLTFLoader, 'models/modern_gaming_setup.glb');
