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
  const leftTurnAppliedRef = useRef(false);
  const headWorldPosition = useMemo(() => new THREE.Vector3(), []);
  const forwardDirection = useMemo(() => new THREE.Vector3(), []);
  const forwardTarget = useMemo(() => new THREE.Vector3(), []);
  const { scene } = useGLTF('models/avatar-whit-clotes.glb');
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);

  const { animations: typingAnimation } = useFBX('animations/Typing.fbx');
  const { animations: standingAnimation } = useFBX('animations/Standing Idle.fbx');
  const { animations: fallingAnimation } = useFBX('animations/Falling To Landing.fbx');
  const { animations: greetingAnimation } = useFBX('animations/Standing Greeting.fbx');
  const { animations: leftTurnAnimation } = useFBX('animations/Left Turn.fbx');
  const { animations: standToSitAnimation } = useFBX('animations/Stand To Sit.fbx');

  typingAnimation[0].name = 'Typing';
  standingAnimation[0].name = 'Standing';
  fallingAnimation[0].name = 'Falling';
  greetingAnimation[0].name = 'Greeting';
  leftTurnAnimation[0].name = 'LeftTurn';
  standToSitAnimation[0].name = 'StandToSit';

  const { actions, mixer } = useAnimations(
    [
      typingAnimation[0],
      standingAnimation[0],
      fallingAnimation[0],
      greetingAnimation[0],
      leftTurnAnimation[0],
      standToSitAnimation[0],
    ],
    group
  );

  useFrame((state) => {
    if (!group.current) return;

    // Cursor tracking only happens while Typing is active.
    const typingAction = actions['Typing'];
    if (!typingAction?.isRunning()) return;

    if (headFollow || cursorFollow) {
      const head = group.current.getObjectByName('Head');
      if (!head) return;

      head.getWorldPosition(headWorldPosition);
      const body = group.current.getObjectByName('Hips') ?? group.current;
      body.getWorldDirection(forwardDirection);
      forwardTarget.copy(headWorldPosition).addScaledVector(forwardDirection, 2);
      head.lookAt(forwardTarget);
    }
  });

  // Play opening sequence: Greeting -> LeftTurn -> StandToSit -> Typing
  useEffect(() => {
    const greeting = actions['Greeting'];
    const leftTurn = actions['LeftTurn'];
    const standToSit = actions['StandToSit'];
    const typing = actions['Typing'];
    if (!greeting || !leftTurn || !standToSit || !typing || sequenceStartedRef.current) return;

    sequenceStartedRef.current = true;
    greeting.reset().setLoop(THREE.LoopOnce, 1).play();
    greeting.clampWhenFinished = true;
    const onFinished = (event) => {
      if (event.action === greeting) {
        leftTurn.reset().setLoop(THREE.LoopOnce, 1).fadeIn(0.35).play();
        leftTurn.clampWhenFinished = true;
        greeting.fadeOut(0.35);
        return;
      }

      if (event.action === leftTurn) {
        if (!leftTurnAppliedRef.current && group.current) {
          // Keep avatar turned after Left Turn, instead of snapping back.
          group.current.rotation.y += Math.PI / 2;
          leftTurnAppliedRef.current = true;
        }
        standToSit.reset().setLoop(THREE.LoopOnce, 1).fadeIn(0.35).play();
        standToSit.clampWhenFinished = true;
        leftTurn.fadeOut(0.35);
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
