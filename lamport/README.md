# Lamport Clock Algorithm 

## Overview
The Lamport Clock is a logical clock algorithm used to order events in a distributed system. It ensures that if one event happens before another, the timestamp of the first event will be smaller than the timestamp of the second event. This algorithm is particularly useful in systems where physical clocks are not synchronized. This system was created based on the example of this [blog post](https://medium.com/outreach-prague/lamport-clocks-determining-the-order-of-events-in-distributed-systems-41a9a8489177).

The idea is to simulate a buying flow where every step sends the log to the same server. To illustrate the Lamport clock usage, we define a strictly higher delay (timeout) from the first service to the latest ones. That way, the log that occurred first (in time) will get later in the logging service, which will use the Lamport counter to order the logs and display them correctly.

The services diagram is as follows:
![Service Diagram](https://miro.medium.com/v2/resize:fit:4800/format:webp/0*qVbCDkpzLy1nhhGz)

The Lamport clock implementation was inspired by the Go sample used in the blog post above, but was converted to JavaScript.

The communication method used was RPC, using the [`json-rpc-2.0`](https://www.npmjs.com/search?q=jsonrpc-2.0) library.


## Communication Method
The services in this system communicate using JSON-RPC over HTTP. JSON-RPC is a remote procedure call (RPC) protocol encoded in JSON, allowing for the exchange of structured data between services.

## Services and Communication Flow
1. **Sales Service**: Initiates sales processing and logs sales events.
2. **Product Service**: Processes product information and forwards the event to the logging and invoice services.
3. **Invoice Service**: Processes invoice information and logs the event.
4. **Logging Service**: Logs events from other services and ensures the correct order based on Lamport timestamps.

## Docker Setup
The provided docker-compose.yml file defines four services: sales-service, product-service, invoice-service, and logging-service. All services are connected via a bridge network called service-network.

## Running the System
This system was implemented using Docker containers, to run it you can use the `docker-compose.yml` file to set up network, build the images, and define service names 
1. Build and start the services:
     ```sh
     docker-compose up --build --scale websocket-client=n
     ```
     Where `n` is the number of clients you want in the system
2. The Sales Service will start sending requests to the Product Service and Logging Service, simulating sales processes.

## Code Explanation
### Client (Sales Service)
- **Client Setup**: Uses JSONRPCClient to send requests to the Product Service and Logging Service.
- **Lamport Clock Initialization**: An instance of LamportClock is created and used to timestamp events.
- **Request Loop**: Sends multiple requests to the Product and Logging Services, each with an incremented Lamport timestamp.
### Product Service
- **Processing Sales**: Handles the processSale method. Updates the Lamport timestamp, logs the event, and forwards the event to the Invoice Service.
- **Invoice Processing**: Forwards the event to the Invoice Service and awaits response.
### Invoice Service
- **Processing Invoices**: Handles the processInvoice method. Updates the Lamport timestamp and logs the event.
### Logging Service
- **Logging Events**: Handles the logging method. Maintains a list of events for each product ID, ensuring events are logged in the correct order based on Lamport timestamps.
