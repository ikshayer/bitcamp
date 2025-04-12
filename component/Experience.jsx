'use client'

import { Environment, OrthographicCamera, Html, useGLTF, OrbitControls } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
// import { useControls } from "leva";
import {useState, useRef, useEffect } from "react";
// import { CharacterController } from "./CharacterController";
import { createDetection } from "./game.js";

import Glove from "./Glove.jsx";
import { Head } from "./Head.jsx";
import RightGlove from "./RightGlove.jsx";

export const Experience = ({videoRef}) => {


  
/*
  useFrame(({ camera }) => {
    if (focusOnTV) {
      // Smoothly move the camera to the TV position
      camera.position.set({ x: 13.5, y: -2.3, z: -2 }); // Adjust TV position
      camera.lookAt(0, 4, 0); // Adjust TV focus point
      camera.rotation.y = 0
      camera.rotation.z = 0
      camera.rotation.x = 0
    }

    
    if (htmlRef.current && inTriggerZone) {
        if(htmlRef.current.position !== camera.position){
        htmlRef.current.position.copy(camera.position); // Match the camera's position
        }
      }
  });
*/

const [leftHandPosition, setLeftHandPosition] = useState({ x: 0, y: 0, z: 0 });
const [rightHandPosition, setRightHandPosition] = useState({ x: 0, y: 0, z: 0 });
const [facePosition, setFacePosition] = useState({ x: 0, y: 0, z: 0 });

useEffect(() => {
    // Listen for left hand position updates

    const { setupCamera } = createDetection(videoRef.current);

        setupCamera()
            .then(() => {
                console.log("Camera setup complete.");
            })
            .catch((error) => {
                console.error("Error during camera setup:", error);
            });

        const handleLeftHandUpdate = (event) => {
            setLeftHandPosition(event.detail);
            console.log("Left Hand Position Updated:", event.detail); // Log left hand position
        };

        const handleRightHandUpdate = (event) => {
            setRightHandPosition(event.detail);
            console.log("Right Hand Position Updated:", event.detail); // Log right hand position
        };

        const handleFaceUpdate = (event) => {
            setFacePosition(event.detail);
            console.log("Face Position Updated:", event.detail); // Log face position
        };

        window.addEventListener("lefthandpositionupdate", handleLeftHandUpdate);
        window.addEventListener("righthandpositionupdate", handleRightHandUpdate);
        window.addEventListener("facepositionupdate", handleFaceUpdate);

        return () => {
            window.removeEventListener("lefthandpositionupdate", handleLeftHandUpdate);
            window.removeEventListener("righthandpositionupdate", handleRightHandUpdate);
            window.removeEventListener("facepositionupdate", handleFaceUpdate);
        };
    }, []);

  return (
    <>


      <directionalLight
      position={[10, 10, 10]} intensity={1} castShadow
      >
      </directionalLight>
      <ambientLight intensity={1} />
      <OrbitControls/>
      
    
      <Physics debug={true}>
        <Glove handPosition={leftHandPosition}/>
        <RightGlove handPosition={rightHandPosition} position={[25,3,-3]} rot={[0, Math.PI, 0]}/>
        <Head position={[8, 15, -0.5]} scale={[0.05, 0.05, 0.05]} rot={[0, Math.PI/2, 0]}/>
        <Glove position={[8, 2, 2]} rot={[0, 0, 0]}/>
        <RightGlove position={[8,2,-2.5]} rot={[0, 0, 0]}/>
      </Physics>

    </>
  );
};
