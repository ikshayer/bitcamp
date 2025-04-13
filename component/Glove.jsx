import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const Glove = ({
  position = [25, 3, 3],
  scale = [10, 10, 10],
  onHit,
  rot = [0, Math.PI, 0],
  handPosition,
  ...props
}) => {
  const { scene } = useGLTF("/models/glove.glb");
  const group = useRef();
  const rigidBodyRef = useRef();
  const clonedScene = scene.clone();

  const currentPosition = useRef(new THREE.Vector3(...position));
  const velocity = new THREE.Vector3();

  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [clonedScene]);

  useFrame(() => {
    if (handPosition && rigidBodyRef.current) {
      const target = new THREE.Vector3(
        handPosition.x,
        handPosition.y,
        handPosition.z
      );

      // Smoothly interpolate toward target
      currentPosition.current.lerp(target, 0.3);

      // Compute velocity needed to move to interpolated position
      const current = rigidBodyRef.current.translation();
      velocity.set(
        currentPosition.current.x - current.x,
        currentPosition.current.y - current.y,
        currentPosition.current.z - current.z
      );

      rigidBodyRef.current.setLinvel(
        { x: velocity.x*4, y: velocity.y*20, z: velocity.z*20 },
        true
      );
    }
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      type="dynamic"
      gravityScale={0}
      friction={0.2}
      restitution={0.6}
      lockRotations={true}
      colliders="hull"
      position={position}
      rotation={rot}
      scale={scale}
      onCollisionEnter={({ other }) => {
        console.log("hits left");
        if(other.rigidBodyObject.name === "head")
          onHit();
        velocity.set(
          -velocity.x*3, 0, 0
        );
      }}
    >
      <primitive object={clonedScene} {...props} />
    </RigidBody>
  );
};

export default Glove;

useGLTF.preload("/models/glove.glb");
