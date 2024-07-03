const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const wss = new WebSocket.Server({ port: 8080 });
const clients = [];

// Handle new connection
wss.on('connection', function connection(ws) {
  const clientId = generateUniqueId();
  const clientInfo = { clientId, ws };
  clients.push(clientInfo);

  ws.on('message', function incoming(message) {
    const parsedMessage = JSON.parse(message);
    const { method, data, senderId } = parsedMessage;

    switch (method) {
      case 'greeting':
        sendReply(senderId, 'response', 'Hello, client!');
        break;
      case 'election':
        handleSendToNextNode(senderId, parsedMessage)
        break;
      case 'newLeader':
        for (const obj of clients) {
          obj.ws.send(message);
        }
        break;
      case 'checkLeader':
        sendTo(parsedMessage.data.leaderId, message);
        break;
      case 'answerLeader':
        sendTo(parsedMessage.data.destinationId, message);
        break;
      default:
        console.warn('Unknown method:', method);
    }
  });

  ws.on('close', () => {
    removeClient(clientId);
  });

  ws.send(JSON.stringify({ method: 'welcome', data: 'Welcome to the WebSocket server!', clientId }));
});

console.log('WebSocket server is now running on ws://localhost:8080');

function sendReply(clientId, method, data) {
  const clientWs = getClientWs(clientId);
  if (clientWs && clientWs.readyState === WebSocket.OPEN) {
    const message = JSON.stringify({ method, data, clientId });
    clientWs.send(message);
  } else {
    console.warn(`Client ${clientId} is not connected.`);
  }
}

function sendTo(targetId, message) {
  const target = clients.find((obj) => obj.clientId === targetId);

  if (target) {
    target.ws.send(message)
  }
}
function handleSendToNextNode(senderId, message) {
  const senderIndex = clients.findIndex(client => client.clientId === senderId);
  if (senderIndex !== -1) {
    const nextIndex = (senderIndex + 1) % clients.length;
    const nextClient = clients[nextIndex];
    const messageString = JSON.stringify({ ...message, senderId });
    nextClient.ws.send(messageString);
  } else {
    console.warn(`Sender ${senderId} not found.`);
  }
}

function getClientWs(clientId) {
  const client = clients.find(client => client.clientId === clientId);
  return client ? client.ws : null;
}

function removeClient(clientId) {
  const index = clients.findIndex(client => client.clientId === clientId);
  if (index !== -1) {
    clients.splice(index, 1);
  }
}

function generateUniqueId() {
  return Math.random().toString(36).substr(2, 9);
}
