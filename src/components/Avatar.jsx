import React, { useEffect, useMemo, useRef } from 'react';
import { useAnimations, useFBX, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';

export function Avatar({
  animation = 'Standing',
  headFollow = false,
  cursorFollow = false,
  wireframe = false,
  ...props
}) {
  const group = useRef();
  const { scene } = useGLTF('models/avatar-whit-clotes.glb');
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);

  const { animations: typingAnimation } = useFBX('animations/Typing.fbx');
  const { animations: standingAnimation } = useFBX('animations/Standing Idle.fbx');
  const { animations: fallingAnimation } = useFBX('animations/Falling To Landing.fbx');
  const { animations: greetingAnimation } = useFBX('animations/Standing Greeting.fbx');

  typingAnimation[0].name = 'Typing';
  standingAnimation[0].name = 'Standing';
  fallingAnimation[0].name = 'Falling';
  greetingAnimation[0].name = 'Greeting';

  const { actions } = useAnimations(
    [typingAnimation[0], standingAnimation[0], fallingAnimation[0], greetingAnimation[0]],
    group
  );

  useFrame((state) => {
    if (!group.current) return;
    if (headFollow) {
      group.current.getObjectByName('Head')?.lookAt(state.camera.position);
    }
    if (cursorFollow) {
      const target = new THREE.Vector3(state.mouse.x, state.mouse.y, 1);
      group.current.getObjectByName('Spine2')?.lookAt(target);
    }
  });

  // On mount: play Greeting once, then transition to the requested animation
  useEffect(() => {
    const greeting = actions['Greeting'];
    const idle = actions[animation];
    if (!greeting || !idle) return;

    greeting.reset().setLoop(THREE.LoopOnce, 1).play();
    greeting.clampWhenFinished = true;

    const greetingDuration = greeting.getClip().duration;
    const transitionAt = Math.max(0, greetingDuration - 0.5) * 1000;

    const timer = setTimeout(() => {
      idle.reset().fadeIn(0.5).play();
      greeting.fadeOut(0.5);
    }, transitionAt);

    return () => clearTimeout(timer);
    // Only runs on mount — intentionally omitting deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle subsequent animation changes (after mount)
  useEffect(() => {
    const action = actions[animation];
    if (!action) return;

    // Skip on first render — the mount effect handles it
    const greeting = actions['Greeting'];
    if (greeting?.isRunning()) return;

    action.reset().fadeIn(0.5).play();
    return () => {
      action.fadeOut(0.5);
    };
  }, [animation, actions]);

  useEffect(() => {
    clone.traverse((obj) => {
      if (obj.isMesh || obj.isSkinnedMesh) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m) => { m.wireframe = wireframe; });
      }
    });
  }, [wireframe, clone]);

  return (
    <group {...props} ref={group} dispose={null}>
      <primitive object={clone} />
    </group>
  );
}

useGLTF.preload('models/avatar-whit-clotes.glb');
