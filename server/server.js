const WebSocket = require("ws");

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 8080 });
console.log("Signaling server is running on ws://localhost:8080");

// Map to store client roles
const clients = new Map();

wss.on("connection", (ws) => {
  console.log("New client connected.");
  console.log(`Total clients connected: ${wss.clients.size}`);

  // Handle incoming messages
  ws.on("message", (message) => {
    try {
      const parsedMessage = JSON.parse(message);
      console.log("Message received from client:", parsedMessage);

      // Set client role if provided
      if (parsedMessage.role) {
        clients.set(ws, parsedMessage.role);
        console.log(`Client role set to: ${parsedMessage.role}`);
        return;
      }

      // Routing logic
      const targetRole = parsedMessage.role === "offerer" ? "answerer" : "offerer";
      for (const [client, role] of clients.entries()) {
        if (client !== ws && role === targetRole && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(parsedMessage));
          console.log(`Message routed to ${role}`);
        }
      }
    } catch (error) {
      console.error("Error parsing message:", message, error);
    }
  });

  // Handle client disconnection
  ws.on("close", () => {
    clients.delete(ws);
    console.log("Client disconnected.");
    console.log(`Total clients remaining: ${wss.clients.size}`);
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});