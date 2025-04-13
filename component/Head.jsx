import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export const Head = ({ position, scale, rot, ...props }) => {
  const { scene } = useGLTF("/models/head.glb"); // Load the head model
 
  const clonedScene = scene.clone(); // Clone the model to safely modify it
  const rigidBodyRef = useRef(); // Ref for the RigidBody
  const timeRef = useRef(0); // Track time for movement

  useEffect(() => {
    // Enable shadows for the cloned model
    clonedScene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [clonedScene]);

  useFrame((state, delta) => {
    if (rigidBodyRef.current) {
      timeRef.current += delta;

      // Calculate new position using a sine wave for smooth movement
      const x = position[0] + Math.sin(timeRef.current) * 5; // Move left and right
      const y = position[1] + Math.sin(timeRef.current * 2) * 2; // Move up and down
      const z = position[2] + Math.cos(timeRef.current) * 5; // Move forward and backward

      // Update the RigidBody's position
      rigidBodyRef.current.setNextKinematicTranslation(new THREE.Vector3(x, y, z));
    }
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      type="kinematicPosition" // Kinematic body to allow manual position updates
      colliders="hull"
      name="head"
      position={position}
      scale={scale}
      rotation={rot}
    >
      <primitive object={clonedScene} {...props} />
    </RigidBody>
  );
};