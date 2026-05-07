import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAnimations, useFBX, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';

export function Avatar({
  headFollow = true,
  cursorFollow = true,
  wireframe = false,
  greetingOffset = [-0.15, 0, 0],
  standToSitOffset = [0, 0, 0.5],
  typingOffset = [0, 0, 0.07],
  typingRotation = [0, 0.25, 0],
  cursorYawIntensity = 0.35,
  cursorPitchIntensity = 0.2,
  ...props
}) {
  const group = useRef();
  const sequenceStartedRef = useRef(false);
  const leftTurnAppliedRef = useRef(false);
  const pointerOnPageRef = useRef(false);
  const [activeClip, setActiveClip] = useState('Greeting');
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

  // Track whether the cursor is actually inside the page/window. Without this,
  // r3f's state.mouse keeps its last value when the cursor leaves the canvas
  // (or moves to another monitor), which makes the head stick to a stale target.
  useEffect(() => {
    const markOut = () => {
      pointerOnPageRef.current = false;
    };
    const markIn = () => {
      pointerOnPageRef.current = true;
    };
    const handlePointerOut = (event) => {
      // relatedTarget === null means the pointer left the window entirely.
      if (!event.relatedTarget) markOut();
    };
    const handlePointerOver = () => markIn();

    document.addEventListener('mouseleave', markOut);
    document.addEventListener('mouseenter', markIn);
    document.addEventListener('mouseout', handlePointerOut);
    document.addEventListener('mouseover', handlePointerOver);
    window.addEventListener('blur', markOut);
    window.addEventListener('focus', markIn);

    return () => {
      document.removeEventListener('mouseleave', markOut);
      document.removeEventListener('mouseenter', markIn);
      document.removeEventListener('mouseout', handlePointerOut);
      document.removeEventListener('mouseover', handlePointerOver);
      window.removeEventListener('blur', markOut);
      window.removeEventListener('focus', markIn);
    };
  }, []);

  useFrame((state) => {
    if (!group.current) return;

    const typingAction = actions['Typing'];
    if (!typingAction?.isRunning()) return;
    if (!(headFollow || cursorFollow)) return;
    if (!pointerOnPageRef.current) return;

    const head = group.current.getObjectByName('Head');
    if (!head) return;

    // Add a small head turn proportional to the cursor position, applied on top
    // of the animation pose (which already inherits the body rotation chain).
    // Centered cursor = no extra rotation, edges = max intensity.
    head.rotation.y -= state.mouse.x * cursorYawIntensity;
    head.rotation.x -= state.mouse.y * cursorPitchIntensity;
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
        setActiveClip('LeftTurn');
        return;
      }

      if (event.action === leftTurn) {
        // Persist the rotation so the avatar stays facing left after the clip ends.
        if (!leftTurnAppliedRef.current && group.current) {
          group.current.rotation.y += Math.PI / 2;
          leftTurnAppliedRef.current = true;
        }
        standToSit.reset().setLoop(THREE.LoopOnce, 1).fadeIn(0.35).play();
        standToSit.clampWhenFinished = true;
        leftTurn.fadeOut(0.35);
        setActiveClip('StandToSit');
        return;
      }

      if (event.action === standToSit) {
        typing.reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(0.35).play();
        standToSit.fadeOut(0.35);
        setActiveClip('Typing');
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

  const clipOffset =
    activeClip === 'Greeting'
      ? greetingOffset
      : activeClip === 'StandToSit'
      ? standToSitOffset
      : activeClip === 'Typing'
      ? typingOffset
      : [0, 0, 0];

  const clipRotation = activeClip === 'Typing' ? typingRotation : [0, 0, 0];

  return (
    <group {...props} ref={group} dispose={null}>
      <group position={clipOffset} rotation={clipRotation}>
        <primitive object={clone} />
      </group>
    </group>
  );
}

useGLTF.preload('models/avatar-whit-clotes.glb');
