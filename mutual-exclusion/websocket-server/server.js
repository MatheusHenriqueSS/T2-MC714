const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const wss = new WebSocket.Server({ port: 8080 });
const clients = new Map();

wss.on('connection', function connection(ws) {
  const clientId = generateUniqueId();
  clients.set(clientId, ws);


  ws.on('message', function incoming(message) {
    const parsedMessage = JSON.parse(message);
    const { method, data, senderId } = parsedMessage;


    switch (method) {
      case 'greeting':
        sendReply(senderId, 'response', 'Hello, client!');
        break;

      case 'request':
        wss.clients.forEach(function each(client) {
          client.send(message);
        });
        break;

      case 'release':
        wss.clients.forEach(function each(client) {
          client.send(message)
        })
        break;

      case 'reply':
        const destinationws = clients.get(parsedMessage.data.authorizedId);
        destinationws.send(JSON.stringify({
          method: 'reply',
        }))
        break;
      default:
        console.warn('Unknown method:', method);
    }
  });

  ws.on('close', () => {
    clients.delete(clientId);
  });


  ws.send(JSON.stringify({ method: 'welcome', data: 'Welcome to the WebSocket server!', clientId }));
});

console.log('WebSocket server is not running on ws://localhost:8080');

function sendReply(clientId, method, data) {
  const clientWs = clients.get(clientId);
  if (clientWs && clientWs.readyState === WebSocket.OPEN) {
    const message = JSON.stringify({ method, data, clientId });
    clientWs.send(message);
  } else {
    console.warn(`Client ${clientId} is not connected.`);
  }
}

function generateUniqueId() {
  return Math.random().toString(36).substr(2, 9);
}
