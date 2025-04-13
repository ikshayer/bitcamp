import { useEffect, useState } from "react";
import { Hands } from "@mediapipe/hands";


export function useHandTracking(videoRef, canvasRef) {
  const [leftHand, setLeftHand] = useState(null);
  const [rightHand, setRightHand] = useState(null);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 0,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hands.onResults((results) => {

        

      const landmarks = results.multiHandLandmarks;
      const handedness = results.multiHandedness;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (landmarks && handedness) {
        landmarks.forEach((landmarkSet, i) => {
          const label = handedness[i].label;
          const wrist = landmarkSet[0];
          const middleKnuckle = landmarkSet[9];

            const dx = middleKnuckle.x - wrist.x;
            const dy = middleKnuckle.y - wrist.y;
            const dz = middleKnuckle.z - wrist.z;

            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
          


          if (label === "Right") {

            let position = {
           
                x:  -(-dist * 130 + 1.94) + 0.6091395289270614 -1.2 -0.3,
                y: (0.5 - wrist.y) * 12 +1.33 - 0.2100561428070069,
                z: -((wrist.x - 0.5) * 12 - 0.87) - 0.34310298681259155,
              };
            position = {
           
                x:  -position.x + 7.3 + 8 + 16 ,
                y: position.y + 0.06 -0.40 + 1.35+6,
                z: -position.z - 0.77 + 0.44,
              };    
              //console.log("left")
              //console.log(position)
            setLeftHand(position);
          } else if (label === "Left") {
            
            let position = {
           
                x:  -(-dist * 130 + 1.94) + 0.6091395289270614 -1.2 -0.3,
                y: (0.5 - wrist.y) * 12 +1.33 - 0.2100561428070069,
                z: -((wrist.x - 0.5) * 12 - 0.87) - 0.34310298681259155,
              };
            position = {
           
                x:  -position.x + 7.3 + 8 + 17 ,
                y: position.y + 0.06 -0.40 + 1.35+6,
                z: -position.z - 0.77 + 0.44,
              };    

             // console.log(position)
            setRightHand(position);
          }
        });
      } else {
        setLeftHand(null);
        setRightHand(null);
      }
    });

    const setup = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 640, height: 480 },
        });

        console.log("📸 Camera stream started");
        video.srcObject = stream;

        await new Promise((resolve) => {
          video.onloadedmetadata = () => {
            video.play();
            resolve();
          };
        });

        const detect = async () => {
          if (video.readyState === 4) {
            await hands.send({ image: video });
            
          }
          requestAnimationFrame(detect);
        };

        detect();
      } catch (err) {
        console.error("❌ Error accessing webcam:", err);
        alert("Could not access webcam. Please check your camera permissions.");
      }
    };

    setup();

    return () => {
      if (video.srcObject) {
        video.srcObject.getTracks().forEach((track) => track.stop());
        console.log("🛑 Camera stream stopped");
      }
    };
  }, [videoRef, canvasRef]);

  return { leftHand, rightHand};
}
