const WebSocket = require('ws');

const ws = new WebSocket('ws://websocket-server:8080');
let clientId = null;
const rank = Math.floor(Math.random() * 1000)
let leaderId = null;
let havingElection = false;
let timeoutId;

function sendMessage(method, data) {
  // Create a message with the method, data, and Lamport timestamp
  const message = {
    method,
    data,
    senderId: clientId
  };


  // Convert the message to a JSON string
  const messageString = JSON.stringify(message);

  // Send the message to the server
  ws.send(messageString);
}

function handleIncomingMessage(messageString) {
  const message = JSON.parse(messageString);
  const { method, data, clientId: senderId, timestamp } = message;

  if (timestamp) lp.update(timestamp);

  switch (method) {
    case 'welcome':
      clientId = message.clientId;
      console.log(`clientId: ${clientId} has rank ${rank}`)
      // setTimeout(() => executeWithRandomDelay(makeRequest), 60000);
      break;
    case 'sendToNextNode':
      console.log(`${clientId} received from ${message.senderId}`)
      break
    case 'election':
      handleElection(message.data.ranks)
      break
    case 'newLeader':
      leaderId = message.data.leaderId;
      console.log(`${clientId} recognizes ${leaderId} as the new leader`)
      break;
    case 'checkLeader':
      sendMessage('answerLeader', { destinationId: message.senderId })
      break;
    case 'answerLeader':
      clearTimeout(timeoutId);
      console.log(`${clientId} checked that everything is fine with leader ${leaderId}`)
      break;
    // Handle other methods
    default:
      console.warn('Unknown method:', method);
  }
}

ws.on('open', function open() {
  // Example of sending a message using the specific method
  sendMessage('greeting', 'Hello from the client!');
});

ws.on('message', function incoming(data) {
  handleIncomingMessage(data.toString());
});

const handleElection = (ranks) => {
  const myRank = ranks.find((r) => r.clientId === clientId)
  if (myRank) {
    let ma = rank;
    let curClient = clientId;

    for (const obj of ranks) {
      if (obj.rank > ma) {
        ma = obj.rank
        curClient = obj.clientId
      }
    }
    havingElection = false;
    console.log(ranks);
    console.log(curClient)
    sendMessage('newLeader', { leaderId: curClient })
  }
  else {
    ranks.push({ rank, clientId })
    sendMessage('election', { ranks })
  }
}

const sendToNextNode = () => {
  sendMessage('sendToNextNode', null)
}

const startElection = () => {
  havingElection = true;
  sendMessage('election', { ranks: [{ rank, clientId }] })
}

const checkLeader = () => {
  if (!leaderId) {
    startElection();
    return;
  }
  if (leaderId === clientId) return
  if (havingElection) return

  sendMessage('checkLeader', { leaderId });
  timeoutId = setTimeout(() => {
    console.log('the leader has failed, starting a new election')
    startElection();
  }, 5000)
}

setInterval(() => checkLeader(), 10000)
