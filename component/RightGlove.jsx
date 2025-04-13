import { useAnimations, useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";

const Glove = ({position=[25,3,3], scale=[10, 10, 10], onHit, rot=[0, Math.PI, 0], handPosition, ...props }) => {
  const { scene } = useGLTF("/models/rightGlove.glb"); // Ensure the path is correct
  const group = useRef(); // Ref for the group containing the model
  const clonedScene = scene.clone()
  const rigidBodyRef = useRef(); // RigidBody ref

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
    if (handPosition && rigidBodyRef.current) {
      rigidBodyRef.current.setNextKinematicTranslation(handPosition);
      console.log(handPosition)
    }
  });

  // Add rotation effect

  return (
    <RigidBody ref={rigidBodyRef} 
    friction={0.1} // Low friction for slipperiness
      restitution={0.8} // High restitution for bounciness
      onCollisionEnter={(other) => {
        console.log("hits")
        if (other.rigidBodyObject?.name === "head") {
          onHit(); // Call the onHit callback when the glove hits the head
        }
      }}
    type="kinematicPosition" colliders="trimesh" position={position} scale={scale} rotation={rot}>
      <primitive object={clonedScene} {...props} />
    </RigidBody>
  );
};

export default Glove;

useGLTF.preload("/models/rightGlove.glb");