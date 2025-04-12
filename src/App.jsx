import { Canvas } from "@react-three/fiber"
import { Experience } from "../component/Experience"
import { useRef } from "react"


export default function App() {

  const videoRef = useRef(null);
  
  return(
    <>
    <video id="video-feed" style={{ display: "none" }} ref={videoRef}/>
    <div style={{ height: '100vh', width: '100%', position: 'relative'}}>
    <Canvas camera={{position: [20, 20, 0]}}>
      
    <Experience videoRef={videoRef}/>
    </Canvas>
    </div>
    </>
  )
}

