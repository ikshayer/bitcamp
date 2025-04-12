import { Hands, HAND_CONNECTIONS } from "@mediapipe/hands";
import { FaceMesh, FACEMESH_TESSELATION } from "@mediapipe/face_mesh";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

export const createDetection = (videoElement, canvasElement) => {
  const video = videoElement;
  const canvas = canvasElement;
  const ctx = canvas.getContext("2d");

  // Initialize MediaPipe Hands and FaceMesh
  const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
  });

  const faceMesh = new FaceMesh({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
  });

  hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  faceMesh.setOptions({
    maxNumFaces: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7,
  });

  const setupCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });
  
      console.log("Camera stream started."); // Log when the camera starts
      video.srcObject = stream;
  
      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          video.play();
          resolve();
        };
      });
  
      hands.onResults(onHandsResults);
      faceMesh.onResults(onFaceResults);
    } catch (error) {
      console.error("Error accessing webcam:", error);
      alert("Could not access webcam. Please make sure you have granted camera permissions.");
      throw error;
    }
  };

  const onHandsResults = (results) => {
    console.log("onHandsResults called:", results); // Log results
    if (results.multiHandLandmarks) {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
  
      results.multiHandLandmarks.forEach((landmarks) => {
        drawConnectors(ctx, landmarks, HAND_CONNECTIONS, { color: "#00FF00", lineWidth: 2 });
        drawLandmarks(ctx, landmarks, { color: "#FF0000", lineWidth: 1 });
      });
    } else {
      console.log("No hands detected."); // Log if no hands are detected
    }
  };
  
  const onFaceResults = (results) => {
    console.log("onFaceResults called:", results); // Log results
    if (results.multiFaceLandmarks) {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
  
      results.multiFaceLandmarks.forEach((landmarks) => {
        drawConnectors(ctx, landmarks, FACEMESH_TESSELATION, { color: "#C0C0C070", lineWidth: 1 });
        drawLandmarks(ctx, landmarks, { color: "#FF0000", lineWidth: 1 });
      });
    } else {
      console.log("No face detected."); // Log if no face is detected
    }
  };

  hands.onResults((results) => {
    console.log("Hands detection results:", results);
    onHandsResults(results);
  });
  
  faceMesh.onResults((results) => {
    console.log("Face detection results:", results);
    onFaceResults(results);
  });

  return {
    setupCamera,
  };
};