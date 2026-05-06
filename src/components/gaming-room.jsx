import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';

export function GamingRoom({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  ...props
}) {
  const { scene } = useGLTF('models/modern_gaming_setup.glb');
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

useGLTF.preload('models/modern_gaming_setup.glb');
