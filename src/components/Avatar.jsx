import React, { useEffect, useMemo, useRef } from 'react';
import { useAnimations, useFBX, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';

export function Avatar({
  headFollow = true,
  cursorFollow = true,
  wireframe = false,
  ...props
}) {
  const group = useRef();
  const sequenceStartedRef = useRef(false);
  const cursorTarget = useMemo(() => new THREE.Vector3(), []);
  const headWorldPosition = useMemo(() => new THREE.Vector3(), []);
  const headScreenPosition = useMemo(() => new THREE.Vector3(), []);
  const amplifiedTarget = useMemo(() => new THREE.Vector3(), []);
  const forwardDirection = useMemo(() => new THREE.Vector3(), []);
  const forwardTarget = useMemo(() => new THREE.Vector3(), []);
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

    // Cursor tracking only happens while Typing is active.
    const typingAction = actions['Typing'];
    if (!typingAction?.isRunning()) return;

    // Amplify cursor movement so head tracking is more visible.
    cursorTarget
      .set(state.mouse.x * 8.1, state.mouse.y * 42.6, 0.28)
      .unproject(state.camera);

    if (headFollow || cursorFollow) {
      const head = group.current.getObjectByName('Head');
      if (!head) return;

      head.getWorldPosition(headWorldPosition);
      headScreenPosition.copy(headWorldPosition).project(state.camera);

      const cursorDistanceToHead = Math.hypot(
        state.mouse.x - headScreenPosition.x,
        state.mouse.y - headScreenPosition.y
      );
      const activationRadius = 0.68;

      // Outside the head zone: keep looking forward.
      if (cursorDistanceToHead > activationRadius) {
        const directionSource = head.parent ?? group.current;
        directionSource.getWorldDirection(forwardDirection);
        forwardTarget.copy(headWorldPosition).addScaledVector(forwardDirection, 2);
        head.lookAt(forwardTarget);
        return;
      }

      amplifiedTarget
        .copy(cursorTarget)
        .sub(headWorldPosition)
        .multiplyScalar(9.6)
        .add(headWorldPosition);

      head.lookAt(amplifiedTarget);
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
