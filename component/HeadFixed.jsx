import { useAnimations, useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";

export const HeadFixed = ({position, scale, rot, ...props}) => {
    const { scene } = useGLTF("/models/head.glb"); // Ensure the path is correct
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
    
    
      // Add rotation effect
    
      return (
        <RigidBody type="fixed" colliders="hull" name="head" position={position} scale={scale} rotation={rot}>
          <primitive ref={group} object={clonedScene} {...props} />
        </RigidBody>
      );
}