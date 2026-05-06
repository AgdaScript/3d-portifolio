import React, { useEffect, useMemo, useRef } from 'react';
import { useAnimations, useFBX, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';

export function Avatar({
  headFollow = false,
  cursorFollow = false,
  wireframe = false,
  ...props
}) {
  const group = useRef();
  const sequenceStartedRef = useRef(false);
  const { scene } = useGLTF('models/avatar-whit-clotes.glb');
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);

  const { animations: typingAnimation } = useFBX('animations/Typing.fbx');
  const { animations: standingAnimation } = useFBX('animations/Standing Idle.fbx');
  const { animations: fallingAnimation } = useFBX('animations/Falling To Landing.fbx');
  const { animations: greetingAnimation } = useFBX('animations/Standing Greeting.fbx');
  const { animations: standToSitAnimation } = useFBX('animations/Stand To Sit.fbx');

  typingAnimation[0].name = 'Typing';
  standingAnimation[0].name = 'Standing';
  fallingAnimation[0].name = 'Falling';
  greetingAnimation[0].name = 'Greeting';
  standToSitAnimation[0].name = 'StandToSit';

  const { actions, mixer } = useAnimations(
    [
      typingAnimation[0],
      standingAnimation[0],
      fallingAnimation[0],
      greetingAnimation[0],
      standToSitAnimation[0],
    ],
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

  // Play opening sequence: Greeting -> StandToSit -> Typing
  useEffect(() => {
    const greeting = actions['Greeting'];
    const standToSit = actions['StandToSit'];
    const typing = actions['Typing'];
    if (!greeting || !standToSit || !typing || sequenceStartedRef.current) return;

    sequenceStartedRef.current = true;
    greeting.reset().setLoop(THREE.LoopOnce, 1).play();
    greeting.clampWhenFinished = true;
    const onFinished = (event) => {
      if (event.action === greeting) {
        standToSit.reset().setLoop(THREE.LoopOnce, 1).fadeIn(0.35).play();
        standToSit.clampWhenFinished = true;
        greeting.fadeOut(0.35);
        return;
      }

      if (event.action === standToSit) {
        typing.reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(0.35).play();
        standToSit.fadeOut(0.35);
        mixer.removeEventListener('finished', onFinished);
      }
    };

    mixer.addEventListener('finished', onFinished);
    return () => {
      mixer.removeEventListener('finished', onFinished);
    };
  }, [actions, mixer]);

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
