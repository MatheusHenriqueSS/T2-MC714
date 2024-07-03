# Distributed System with Leader Election Algorithm

This project demonstrates a distributed system using Docker containers and WebSocket communication to implement a leader election algorithm. The system ensures that one node is elected as the leader among multiple clients.

This implementation is based on the ring leader election algorithm described [here](https://3ev.medium.com/election-algorithm-a-case-study-7f51a4b059e9) and [here](https://www.educative.io/answers/what-is-ring-election-algorithm). The original sample code from the blog post does not handle communication between clients (it simulates the election within the same code), and it has been converted to JavaScript for this project.

This implementation simulates a one-directional ring, meaning in the election procedure, messages are only sent to the next node in the ring. "Next" here refers to the next client in the clients array maintained by the WebSocket server.

## Table of Contents
1. [Architecture](#architecture)
2. [Implementation Details](#implementation-details)
   - [WebSocket Client](#websocket-client)
   - [WebSocket Server](#websocket-server)
3. [Communication Flow](#communication-flow)
4. [Election Procedure](#election-procedure)
5. [How to Run the System](#how-to-run-the-system)

## Architecture

### Services
1. **WebSocket Server**
   - Manages WebSocket connections and forwards messages between clients.
   - Runs on port 8080.

2. **WebSocket Client**
   - Implements the client logic for participating in the leader election algorithm.
   - Multiple instances can run simultaneously to simulate a distributed environment.

### Network
- Both services communicate over a Docker network called `websocket-network`.

## Implementation Details

### WebSocket Client
The WebSocket Client simulates a distributed process that participates in the leader election. Each client is assigned a unique ID and a random rank, which is used during the election process. Clients periodically check the status of the leader and initiate an election if the leader is not responsive.

### WebSocket Server
The WebSocket Server acts as a mediator between clients. It receives messages from one client and forwards them to all other connected clients or a specific client as needed. This ensures that all clients are aware of each other's status and can participate in the leader election process.

## Communication Flow

1. **Initialization**: 
   - When a client connects to the WebSocket server, it receives a unique client ID and a welcome message.

2. **Election Process**:
   - Clients send and receive `election` messages to participate in the election process.
   - Clients send `newLeader` messages to announce the new leader.
   - Clients periodically send `checkLeader` messages to verify the leader's status.

3. **Leader Status Check**:
   - If a client does not receive a response to its `checkLeader` message within 5 seconds, it assumes the leader has failed and starts a new election.

## Election Procedure

1. **Initiating an Election**:
   - When a client detects that the leader is unresponsive, it starts an election by sending an `election` message to all other clients with its rank and client ID.

2. **Handling Election Messages**:
   - When a client receives an `election` message, it checks if its rank is already in the eligible array. If it is, it means that this node started an election and the election event already passed through all the nodes in the ring. So it gets the highest rank in the array and defines it as the new leader. If its rank is not in the array, it means that another node started the election, so it appends its rank to the eligible array and passes the event forward.

3. **Announcing the New Leader**:
   - After the election event has passed in the entire ring, the node who started the election gets the node with highest rank and send a `newLeader` event declaring the new leader.
   - All clients update their leader information based on the `newLeader` message.

4. **Checking Leader Status**:
   - Clients periodically send `checkLeader` messages to ensure the leader is still active.
   - If a client does not receive an `answerLeader` message from the leader within a timeout period, it starts a new election.

## How to Run the System

1. **Prerequisites**:
   - Docker and Docker Compose must be installed on your system.

2. **Setup**:
   - Clone the repository to your local machine.
   - Navigate to the project directory.

3. **Build and Run**:
   - Use Docker Compose to build and run the containers.
     ```sh
     docker-compose up --build --scale websocket-client=n
     ```
     Where `n` is the number of clients you want in the system
   - This command builds the Docker images and starts the WebSocket server and client services.

4. **Testing**:
   - The system will automatically start multiple client instances. Each client will periodically check the leader's status, participate in elections, and log the results.
   - Logs from the clients and server will be displayed in the console, showing the flow of messages and the state of the leader election process.

5. **Stopping the System**:
   - To stop the system, use the following command:
     ```sh
     docker-compose down
     ```

This project demonstrates the implementation of a leader election algorithm in a distributed system using Docker and WebSockets. It ensures that one node is elected as the leader, maintaining the consistency and coordination of the distributed system.
