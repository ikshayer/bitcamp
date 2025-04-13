'use client'

import { Environment, OrthographicCamera, Html, useGLTF, OrbitControls } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
// import { useControls } from "leva";
import {useState, useRef, useEffect } from "react";
// import { CharacterController } from "./CharacterController";
import { createDetection } from "./game.js";
import { HeadFixed } from "./HeadFixed.jsx";
import Glove from "./Glove.jsx";
import { Head } from "./Head.jsx";
import RightGlove from "./RightGlove.jsx";
import { useHandTracking } from "../hooks/useHandTracking.js";

export const Experience = ({videoRef, canvasRef, onHit, headMoving}) => {


  
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

  const { leftHand, rightHand } = useHandTracking(videoRef, canvasRef);

  return (
    <>


      <directionalLight
      position={[10, 10, 10]} intensity={1} castShadow
      >
      </directionalLight>
      <ambientLight intensity={1} />
     
      
    
      <Physics>
        <Glove handPosition={leftHand} onHit={onHit}/>
        <RightGlove handPosition={rightHand} position={[25,3,-3]} rot={[0, Math.PI, 0]} onHit={onHit}/>
        {headMoving ? <Head position={[8, 15, -0.5]} scale={[0.05, 0.05, 0.05]} rot={[0, Math.PI/2, 0]}/> : <HeadFixed position={[8, 15, -0.5]} scale={[0.05, 0.05, 0.05]} rot={[0, Math.PI/2, 0]}/>}
        {/*<Glove position={[8, 2, 2]} rot={[0, 0, 0]} onHit={onHit}/>
        <RightGlove position={[8,2,-2.5]} rot={[0, 0, 0]} onHit={onHit}/>*/}
      </Physics>

    </>
  );
};
