const WebSocket = require('ws');
const { LamportClock } = require('./lamport.js');
const { Queue } = require('./queue.js');

const ws = new WebSocket('ws://websocket-server:8080');

const lp = new LamportClock();
const requests = new Queue();
let requested = false;
let clientId = null;
let auth = 0;
let clientsCounter;

function executeWithRandomDelay(fn) {
  // Helper function to get a random delay between 30s (30000ms) and 2m (120000ms)
  function getRandomDelay() {
    const minDelay = 30000; // 30 seconds in milliseconds
    const maxDelay = 120000; // 2 minutes in milliseconds
    return Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
  }

  // Function to execute the given function in a loop with a random delay
  function loop() {
    // Execute the provided function
    requested == true ? () => console.log('skipped') : fn();

    // Set a timeout to call this function again after a random delay
    const delay = getRandomDelay();
    console.log(`Next execution in ${delay / 1000} seconds`);
    setTimeout(loop, delay);
  }
  // Start the loop
  loop();
}

const makeRequest = () => {
  sendMessage('request', null);
  requested = true;
  requests.enqueue({ counter: lp.getCounter(), clientId })
}

const reply = (timestamp, senderId) => {
  lp.update(timestamp)
  requests.enqueue({ counter: lp.getCounter(), clientId: senderId })
  sendMessage('reply', { authorizedId: senderId })
}

const checkRelease = () => {
  if (auth == clientsCounter - 1 && !requests.isEmpty() && requests.peek().clientId === clientId) {
    auth = 0;
    requested = false;
    console.log('finished critical state')
    sendMessage('release', null)
  }
}

function sendMessage(method, data) {
  // Increment the Lamport clock for a new event
  lp.increment();

  // Create a message with the method, data, and Lamport timestamp
  const message = {
    method,
    data,
    timestamp: lp.getCounter(),
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
      setTimeout(() => executeWithRandomDelay(makeRequest), 60000);
      break;

    case 'request':
      if (message.senderId !== clientId) reply(message.timestamp, message.senderId)
      break;

    case 'reply':
      auth++;
      checkRelease();
      break;
    case 'release':
      if (message.senderId !== requests.peek().clientId) console.log('error: failed request')
      requests.dequeue();
      checkRelease();
      break;
    case 'updateClientsCounter':
      clientsCounter = message.value;
      break

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
