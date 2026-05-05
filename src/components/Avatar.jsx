import React, { useEffect, useMemo, useRef } from 'react'
import { useAnimations, useFBX, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
import { useControls } from "leva";

export function Avatar(props) {

  const { animation } = props;
  const { headFollow, cursorFollow, wireframe } = useControls({
    headFollow: false,
    cursorFollow: false,
    wireframe: false,
  });

  const group = useRef();
  const { scene } = useGLTF('models/avatar-whit-clotes.glb');
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);

  const { animations: typingAnimation } = useFBX('animations/Typing.fbx');
  const { animations: standingAnimation } = useFBX('animations/Standing Idle.fbx');
  const { animations: fallingAnimation } = useFBX('animations/Falling To Landing.fbx');

  typingAnimation[0].name = "Typing";
  standingAnimation[0].name = "Standing";
  fallingAnimation[0].name = "Falling";

  const { actions } = useAnimations(
    [typingAnimation[0], standingAnimation[0], fallingAnimation[0]],
    group
  );

  useFrame((state) => {
    if (!group.current) return;
    if (headFollow) {
      group.current.getObjectByName("Head")?.lookAt(state.camera.position);
    }
    if (cursorFollow) {
      const target = new THREE.Vector3(state.mouse.x, state.mouse.y, 1);
      group.current.getObjectByName("Spine2")?.lookAt(target);
    }
  });

  useEffect(() => {
    if (!actions[animation]) return;
    actions[animation].reset().fadeIn(0.5).play();
    return () => {
      actions[animation].reset().fadeOut(0.5);
    };
  }, [animation]);

  useEffect(() => {
    clone.traverse((obj) => {
      if (obj.isMesh || obj.isSkinnedMesh) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => { m.wireframe = wireframe; });
        } else {
          obj.material.wireframe = wireframe;
        }
      }
    });
  }, [wireframe, clone]);

  return (
    <group {...props} ref={group} dispose={null}>
      <primitive object={clone} />
    </group>
  );
}

useGLTF.preload('models/avatar-whit-clotes.glb')
