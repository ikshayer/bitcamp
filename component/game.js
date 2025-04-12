import { Hands } from "@mediapipe/hands";
import { FaceMesh } from "@mediapipe/face_mesh";

export const createDetection = (videoElement) => {
    const video = videoElement;

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
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7,
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
        if (results.multiHandLandmarks && results.multiHandedness) {
            results.multiHandLandmarks.forEach((landmarks, index) => {
                const handType = results.multiHandedness[index].label; // "Left" or "Right"
                const wrist = landmarks[0];
                const normalizedX = wrist.x * 2 - 1; // Normalize to [-1, 1]
                const normalizedY = -(wrist.y * 2 - 1); // Normalize to [-1, 1]
                const z = wrist.z; // Depth value

                const handPosition = { x: normalizedX * 5, y: normalizedY * 5, z: z * 5 };
                console.log(`${handType} hand position:`, handPosition);
                // Emit events for left and right hands
                const event = new CustomEvent(`${handType.toLowerCase()}HandPositionUpdate`, { detail: handPosition });
                window.dispatchEvent(event);
            });
        }
    };

    const onFaceResults = (results) => {
        if (results.multiFaceLandmarks) {
            const faceLandmarks = results.multiFaceLandmarks[0];
            const nose = faceLandmarks[1]; // Example: Nose landmark
            const normalizedX = nose.x * 2 - 1; // Normalize to [-1, 1]
            const normalizedY = -(nose.y * 2 - 1); // Normalize to [-1, 1]
            const z = nose.z; // Depth value

            const facePosition = { x: normalizedX * 5, y: normalizedY * 5, z: z * 5 };

            // Emit event for face position
            const event = new CustomEvent("facePositionUpdate", { detail: facePosition });
            window.dispatchEvent(event);
        }
    };

    return {
        setupCamera,
    };
};