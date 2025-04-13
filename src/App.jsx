import { Canvas } from "@react-three/fiber";
import { Experience } from "../component/Experience";
import { useRef, useEffect, useState } from "react";

export default function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timer, setTimer] = useState(30);
  const cooldownRef = useRef(false);
  const intervalRef = useRef(null);
  const scoreRef = useRef(0); // Ref to track the current score
  const [headMoving, setHeadMoving] = useState(false); // State to track the head type
  const [leaderboard, setLeaderboard] = useState([]);
  const [playerName, setPlayerName] = useState("");

  const onHit = () => {
    if (!cooldownRef.current) {
      setScore((prevScore) => {
        const newScore = prevScore + 1;
        scoreRef.current = newScore; // Update the ref whenever score changes
        console.log("Hit detected! Current score:", newScore);
        return newScore;
      });

      cooldownRef.current = true;

      const audioFile = Math.random < 0.5 ? "/audio/boom2.mp3" : "/audio/niceShot3.mp3";
      const audio = new Audio(audioFile);
      audio.play();

      setTimeout(() => {
        cooldownRef.current = false;
      }, 3000);
    }
  };

  const startTimer = () => {
    setScore(0);
    setTimer(30);

    intervalRef.current = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(intervalRef.current);

          // Add the current score to the leaderboard if it's valid
          if (scoreRef.current > 0) {
            const newLeaderboard = [
              ...leaderboard,
              { name: playerName || "Anonymous", score: scoreRef.current },
            ];
            newLeaderboard.sort((a, b) => b.score - a.score).slice(0, 10); // Keep top 10 scores
            setLeaderboard(newLeaderboard);
          }

          setHighScore((prevHighScore) => Math.max(scoreRef.current, prevHighScore));
          setScore(0);
          return 30; // Reset timer
        }
        return prevTimer - 1;
      });
    }, 1000);
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
      clearInterval(intervalRef.current);
    };
  }, []);

  const handleSwitchHead = () => {
    setHeadMoving((prev) => !prev);
  }
  
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



    <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          zIndex: 1000,
          backgroundColor: "white",
          borderRadius: "24px",
          padding: "16px",
        }}
      >
        <h1 style={{ color: "black", fontSize: "24px" }}>Score: {score}</h1>
        <h2 style={{ color: "black", fontSize: "20px" }}>High Score: {highScore}</h2>
        <h2 style={{ color: "black", fontSize: "20px" }}>Timer: {timer}s</h2>
        <button
          style={{
            padding: "8px 16px",
            fontSize: "16px",
            marginTop: "8px",
            border: "none",
            borderRadius: "8px",
            backgroundColor: "#4caf50",
            color: "white",
            cursor: "pointer",
          }}
          onClick={() => startTimer()}
        >
          Start
        </button>
        <button
          style={{
            padding: "8px 16px",
            fontSize: "16px",
            marginTop: "8px",
            border: "none",
            borderRadius: "8px",
            backgroundColor: "#000000",
            color: "white",
            cursor: "pointer",
            marginLeft: "8px",
          }}
          onClick={() => handleSwitchHead()}
        >
          {headMoving ? "Level 1" : "Level 2"}
        </button>
        <div style={{ marginTop: "16px" }}>
            <input
              type="text"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              style={{
                padding: "8px",
                fontSize: "16px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                width: "90%",
                color: "black !important",
              }}
            />
          </div>
          <div>
          <h2 style={{ color: "black", fontSize: "20px" }}>Leaderboard</h2>
          <ol style={{ color: "black", listStyleType: "none"}}>
            {leaderboard.map(({ name, score }, index) => (
              <li key={index}>
                {index + 1}. {name} - {score}
              </li>
            ))}
          </ol>
        </div>
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
      
    <Experience videoRef={videoRef} canvasRef={canvasRef} onHit={onHit} headMoving={headMoving}/>
    </Canvas>
    </div>
    </>
  )
}

