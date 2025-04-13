import { useRef, useEffect } from "react";
import useWebRTC from "../hooks/webrtc.js";

export default function Answerer() {
  const { sendMessage, dataChannel } = useWebRTC(false, "ws://172.20.10.5:8080", (data) => {
    console.log("Message received from Offerer:", data);
  });

  const isDataChannelOpen = useRef(false);

  useEffect(() => {
    const checkDataChannelState = setInterval(() => {
      if (dataChannel) {
        isDataChannelOpen.current = dataChannel.readyState === "open";
        console.log("Data channel state (Answerer):", dataChannel.readyState);
      }
    }, 500);

    return () => clearInterval(checkDataChannelState);
  }, [dataChannel]);

  return (
    <div>
      <h1>Answerer</h1>
      <p>
        Data channel status: {isDataChannelOpen.current ? "Open" : "Closed"}
      </p>
    </div>
  );
}