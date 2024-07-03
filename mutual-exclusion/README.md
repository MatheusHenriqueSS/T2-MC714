# Distributed System with Lamport Mutual Exclusion Algorithm

This project demonstrates a distributed system using Docker containers and WebSocket communication to implement the Lamport mutual exclusion algorithm. The system ensures the correct order of event processing across multiple clients.


## Source

This implementation was created from sketch in Javascript, but the lamport mutual exclusion algorithm definition was get from [here](https://www.geeksforgeeks.org/lamports-algorithm-for-mutual-exclusion-in-distributed-system/)

The idea is to simulate a system with `n` clients, where from time to time, they request to enter in a critical state. After getting the authorization from all others clients, it enters in the critical state and after that trigger the `release` event.s

## Table of Contents
1. [Architecture](#architecture)
2. [Implementation Details](#implementation-details)
   - [Lamport Clock](#lamport-clock)
   - [Priority Queue](#priority-queue)
   - [WebSocket Client](#websocket-client)
   - [WebSocket Server](#websocket-server)
3. [Communication Flow](#communication-flow)
4. [How to Run the System](#how-to-run-the-system)

## Architecture

### Services
1. **WebSocket Server**
   - Manages WebSocket connections and forwards messages between clients.
   - Runs on port 8080.

2. **WebSocket Client**
   - Implements the client logic to request access to a critical section using the Lamport mutual exclusion algorithm.
   - Multiple instances can run simultaneously to simulate a distributed environment.

### Network
- Both services communicate over a Docker network called `websocket-network`.

## Implementation Details

### Lamport Clock
The Lamport Clock is a logical clock algorithm used to order events in a distributed system. It assigns a timestamp to each event, ensuring a total ordering of events. Each client maintains its own Lamport clock and updates it based on events and messages received from other clients.

### Priority Queue
A priority queue is used to manage requests in the correct order based on their Lamport timestamps. When a client makes a request to enter the critical section, it is added to the queue. The queue ensures that requests are processed in the order of their timestamps, maintaining the correct sequence of events.

### WebSocket Client
The WebSocket Client simulates a distributed process that needs to access a critical section. It sends requests to enter the critical section, replies to requests from other clients, and releases the critical section once it has completed its task. Each client instance runs a Lamport clock to timestamp its events and messages.

### WebSocket Server
The WebSocket Server acts as a mediator between clients. It receives messages from one client and forwards them to all other connected clients. This ensures that all clients are aware of each other's requests and replies, enabling the mutual exclusion algorithm to function correctly.

## Communication Flow

1. **Initialization**: 
   - When a client connects to the WebSocket server, it receives a unique client ID and a welcome message.

2. **Requesting Access**:
   - A client sends a `request` message to enter the critical section. The request includes the client's Lamport timestamp and client ID.
   - The WebSocket server broadcasts the request to all other clients.

3. **Receiving a Request**:
   - When a client receives a `request` message from another client, it updates its Lamport clock and adds the request to its priority queue.
   - The client sends a `reply` message back to the requesting client.

4. **Entering the Critical Section**:
   - A client can enter the critical section when it has received replies from all other clients and its request is at the front of the priority queue.
   - After completing its task, the client sends a `release` message to inform other clients that it has exited the critical section.

5. **Releasing the Critical Section**:
   - When a client receives a `release` message, it removes the corresponding request from its priority queue and checks if it can now enter the critical section.

## How to Run the System

1. **Prerequisites**:
   - Docker and Docker Compose must be installed on your system.

2. **Setup**:
   - Clone the repository to your local machine.
   - Navigate to the project directory.

3. **Build and Run**:
   - Use Docker Compose to build and run the containers.
     ```sh
     docker-compose up --build
     ```
   - This command builds the Docker images and starts the WebSocket server and client services.

4. **Testing**:
   - The system will automatically start multiple client instances. Each client will periodically request access to the critical section, process it, and release it.
   - Logs from the clients and server will be displayed in the console, showing the flow of messages and the state of the Lamport clocks.

5. **Stopping the System**:
   - To stop the system, use the following command:
     ```sh
     docker-compose down
     ```

This project demonstrates the implementation of the Lamport mutual exclusion algorithm in a distributed system using Docker and WebSockets. It ensures that events are processed in the correct order, maintaining the consistency and correctness of the distributed system.
