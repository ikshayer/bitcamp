import { Canvas } from "@react-three/fiber"
import { Experience } from "../component/Experience"
import { useRef, useEffect, useState } from "react"


export default function App() {

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const cooldownRef = useRef(false); // Cooldown state


  const audio = new Audio("/hit-sound.mp3"); // Path to your MP3 file
      audio.play();

  const onHit = () => {
    if (!cooldownRef.current) {
      setScore((prevScore) => prevScore + 1);
      console.log("Hit detected! Current score:", score + 1);
      cooldownRef.current = true; // Activate cooldown

      const audio = new Audio("/audio/boom2.mp3"); // Path to your MP3 file
      audio.play();


      // Reset cooldown after 1 second
      setTimeout(() => {
        cooldownRef.current = false;
      }, 3000); // Adjust the cooldown duration as needed
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
  
    const handleLoadedMetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    };
  
    if (video) {
      video.addEventListener("loadedmetadata", handleLoadedMetadata);
    }
  
    return () => {
      if (video) {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      }
    };
  }, []);
  
  return(
    <>
    <video id="video-feed" 
    style={{
      position: "absolute",
      top: "10px",
      right: "10px",
      width: "200px",
      height: "150px",
      border: "2px solid #ccc",
      borderRadius: "8px",
      zIndex: 1000,
    }}
    autoPlay
    muted
    ref={videoRef}/>

    <div style={{ position: "absolute", top: "10px", left: "10px", zIndex: 1000, backgroundColor: 'white', borderRadius: "24px"}}>
      <h1 style={{ color: "black", fontSize: "24px", paddingInline:"24px"}}>Score: {score}</h1>
    </div>

    <canvas
        id="landmark-overlay"
        ref={canvasRef}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          width: "200px",
          height: "150px",
          zIndex: 1001, // Ensure it overlays the video
          pointerEvents: "none", // Prevent interaction
        }}
      />

    <div style={{ height: '100vh', width: '100%', position: 'relative'}}>
    <Canvas camera={{position: [20, 20, 0]}}>
      
    <Experience videoRef={videoRef} canvasRef={canvasRef} onHit={onHit}/>
    </Canvas>
    </div>
    </>
  )
}

