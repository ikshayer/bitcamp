import { useEffect, useState } from "react";
import { Hands } from "@mediapipe/hands";
import { FaceMesh } from "@mediapipe/face_mesh";

export function useHandTracking(videoRef, canvasRef) {
  const [leftHand, setLeftHand] = useState(null);
  const [rightHand, setRightHand] = useState(null);
  const [face, setFace] = useState(null);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    const faceMesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.5,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6,
    });

    hands.onResults((results) => {

      const landmarks = results.multiHandLandmarks;
      const handedness = results.multiHandedness;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (landmarks && handedness) {
        landmarks.forEach((landmarkSet, i) => {
          const label = handedness[i].label;
          const wrist = landmarkSet[0];

          const position = {
            x: wrist.x,
            y: -wrist.y,
            z: 5*wrist.x,
          };


          if (label === "Left") {
            setLeftHand(position);
          } else if (label === "Right") {
            setRightHand(position);
          }
        });
      } else {
        setLeftHand(null);
        setRightHand(null);
      }
    });

    faceMesh.onResults((results) => {
      const landmarks = results.multiFaceLandmarks;
      if (landmarks && landmarks[0]) {
        const noseTip = landmarks[0][1]; // nose tip
        const facePos = {
          x: noseTip.x,
          y: noseTip.y,
          z: noseTip.z,
        };
 
        setFace(facePos);
      } else {
        console.log("🚫 No face detected");
        setFace(null);
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
            await faceMesh.send({ image: video });
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

  return { leftHand, rightHand, face };
}
