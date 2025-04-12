import { useEffect, useState } from "react";
import { BoxingGame } from "../component/game.js";

export const useBoxingGame = () => {
    const [leftHandPosition, setLeftHandPosition] = useState({ x: 0, y: 0, z: 0 });
    const [rightHandPosition, setRightHandPosition] = useState({ x: 0, y: 0, z: 0 });

    useEffect(() => {
        const game = new BoxingGame();

        game.setupCamera()
            .then(() => console.log("Camera setup complete."))
            .catch((error) => console.error("Error during camera setup:", error));

        const handleLeftHandUpdate = (event) => setLeftHandPosition(event.detail);
        const handleRightHandUpdate = (event) => setRightHandPosition(event.detail);

        window.addEventListener("lefthandpositionupdate", handleLeftHandUpdate);
        window.addEventListener("righthandpositionupdate", handleRightHandUpdate);

        return () => {
            window.removeEventListener("lefthandpositionupdate", handleLeftHandUpdate);
            window.removeEventListener("righthandpositionupdate", handleRightHandUpdate);
        };
    }, []);

    return { leftHandPosition, rightHandPosition };
};