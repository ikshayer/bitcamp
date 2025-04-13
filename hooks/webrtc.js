import { useRef, useEffect } from "react";

const useWebRTC = (isOfferer, signalingServerUrl, onMessageReceived) => {
  const peerConnection = useRef(null);
  const dataChannel = useRef(null);
  const signalingServer = useRef(null);
  const messageQueue = useRef([]);

  useEffect(() => {
    // Initialize WebSocket connection
    signalingServer.current = new WebSocket(signalingServerUrl);

    signalingServer.current.onopen = () => {
      console.log("WebSocket connection established.");
      // Send queued messages
      while (messageQueue.current.length > 0) {
        const queuedMessage = messageQueue.current.shift();
        signalingServer.current.send(queuedMessage);
        console.log("Sent queued message:", queuedMessage);
      }
    };

    signalingServer.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    signalingServer.current.onclose = () => {
      console.log("WebSocket connection closed.");
    };

    // Handle messages from the signaling server
    signalingServer.current.onmessage = async (message) => {
      const data = JSON.parse(message.data);
      console.log("Signaling message received:", data);

      try {
        if (isOfferer && data.answer) {
          console.log("Answer received from signaling server:", data.answer);
          await peerConnection.current.setRemoteDescription(data.answer);
          console.log("Answer set as remote description.");
        } else if (!isOfferer && data.offer) {
          console.log("Offer received from signaling server:", data.offer);
          await peerConnection.current.setRemoteDescription(data.offer);
          console.log("Offer set as remote description.");

          const answer = await peerConnection.current.createAnswer();
          await peerConnection.current.setLocalDescription(answer);
          console.log("Answer created and set as local description.");

          sendToServer({ answer });
        } else if (data.candidate) {
          console.log("Received ICE candidate from signaling server:", data.candidate);
          await peerConnection.current.addIceCandidate(data.candidate)
            .then(() => console.log("ICE candidate added successfully."))
            .catch((error) => console.error("Error adding ICE candidate:", error));
        }
      } catch (error) {
        console.error("Error handling signaling message:", error);
      }
    };

    // Create peer connection
    peerConnection.current = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" }, // Public STUN server
        {
          urls: "turn:turn.geeky.space:3478", // Public TURN server for testing
          username: "webrtc", // Replace with TURN server username
          credential: "webrtc", // Replace with TURN server password
        },
      ],
    });

    console.log("Peer connection created for Answerer:", peerConnection.current);

    // Connection state changes
    peerConnection.current.onconnectionstatechange = () => {
      console.log("Connection state changed:", peerConnection.current.connectionState);
      if (peerConnection.current.connectionState === "connected") {
        console.log("Peer connection successfully established! Data channel should now be open.");
      } else if (["disconnected", "failed"].includes(peerConnection.current.connectionState)) {
        console.error("Peer connection failed or disconnected.");
      }
    };

    // ICE candidate events
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("Sending ICE candidate:", event.candidate);
        sendToServer({ candidate: event.candidate });
      } else {
        console.log("ICE gathering complete.");
      }
    };

    // Answerer-specific setup
    if (!isOfferer) {
      peerConnection.current.ondatachannel = (event) => {
        dataChannel.current = event.channel;
        console.log("Data channel received by Answerer:", dataChannel.current);

        dataChannel.current.onopen = () => {
          console.log("Data channel is open! Ready for communication.");
        };

        dataChannel.current.onclose = () => {
          console.error("Data channel closed unexpectedly.");
        };

        dataChannel.current.onerror = (error) => {
          console.error("Data channel error:", error);
        };

        dataChannel.current.onmessage = (event) => {
          const receivedData = JSON.parse(event.data);
          console.log("Data received on data channel (Answerer):", receivedData);
          onMessageReceived(receivedData);
        };
      };
    }

    // Cleanup resources
    return () => {
      console.log("Cleaning up resources...");
      if (peerConnection.current) {
        peerConnection.current.close();
        console.log("Peer connection closed.");
      }
      if (dataChannel.current) {
        dataChannel.current.close();
        console.log("Data channel closed.");
      }
      if (signalingServer.current) {
        signalingServer.current.close();
        console.log("WebSocket connection closed.");
      }
    };
  }, [isOfferer, signalingServerUrl, onMessageReceived]);

  const sendMessage = (message) => {
    if (dataChannel.current?.readyState === "open") {
      dataChannel.current.send(JSON.stringify(message));
      console.log("Message sent:", message);
    } else {
      console.error("Data channel is not open. Unable to send message.");
    }
  };

  const sendToServer = (message) => {
    const messageString = JSON.stringify(message);
    if (signalingServer.current.readyState === WebSocket.OPEN) {
      signalingServer.current.send(messageString);
    } else {
      console.error("WebSocket is not open. Adding message to queue.");
      messageQueue.current.push(messageString);
    }
  };

  return { sendMessage, dataChannel: dataChannel.current };
};

export default useWebRTC;