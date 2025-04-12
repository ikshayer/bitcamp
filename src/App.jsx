import { Canvas } from "@react-three/fiber"
import { Experience } from "../component/Experience"


export default function App() {

  
  return(
    <>
    <div style={{ height: '100vh', width: '100%', position: 'relative'}}>
    <Canvas camera={{position: [20, 20, 0]}}>
      
    <Experience />
    </Canvas>
    </div>
    </>
  )
}

