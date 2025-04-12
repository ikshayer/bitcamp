'use client'

import { useAnimations, useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";

const RightGlove = ({position=[25,3,-3], scale=[10, 10, 10], rot=[0, Math.PI, 0], handPosition, ...props }) => {
  const { scene } = useGLTF("/models/gloveRight.glb"); // Ensure the path is correct
  const group = useRef(); // Ref for the group containing the model
  const clonedScene = scene.clone()

  useEffect(() => {
    // Apply transformations to the cloned model

    clonedScene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
      
    });
  }, [clonedScene]);

  useFrame(() => {
    if (handPosition && group.current) {
        group.current.position.set(handPosition.x, handPosition.y, handPosition.z);
    }
  });


  // Add rotation effect

  return (
    <RigidBody type="fixed" colliders="trimesh" position={position} scale={scale} rotation={rot}>
      <primitive ref={group} object={clonedScene} {...props} />
    </RigidBody>
  );
};

export default RightGlove;

useGLTF.preload("/models/gloveRight.glb");