import { JSONRPCClient } from "json-rpc-2.0";
import { LamportClock } from "./lamport.js";

// JSONRPCClient needs to know how to send a JSON-RPC request.
// Tell it by passing a function to its constructor. The function must take a JSON-RPC request and send it.
const client = new JSONRPCClient((jsonRPCRequest) =>
  fetch("http://product-service/json-rpc", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(jsonRPCRequest),
  }).then((response) => {
    if (response.status === 200) {
      // Use client.receive when you received a JSON-RPC response.
      return response
        .json()
        .then((jsonRPCResponse) => client.receive(jsonRPCResponse));
    } else if (jsonRPCRequest.id !== undefined) {
      return Promise.reject(new Error(response.statusText));
    }
  })
);

const client2 = new JSONRPCClient((jsonRPCRequest) =>
  fetch("http://logging-service/json-rpc", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(jsonRPCRequest),
  }).then((response) => {
    if (response.status === 200) {
      // Use client.receive when you received a JSON-RPC response.
      return response
        .json()
        .then((jsonRPCResponse) => client.receive(jsonRPCResponse));
    } else if (jsonRPCRequest.id !== undefined) {
      return Promise.reject(new Error(response.statusText));
    }
  })
);

// Use client.request to make a JSON-RPC request call.
// The function returns a promise of the result.
const lp = new LamportClock();


for (let i = 0; i < 10; i++) {
  const productId = Math.floor(Math.random() * 40)
  lp.increment();

  console.log('vai mandar')
  client
    .request("processSale", { productId, counter: lp.getCounter() })
    .then((result) => console.log(result));

  await new Promise(r => setTimeout(r, Math.floor(Math.random() * 4000)));

  client2
    .request("logging", { message: `Sales processed for product id ${productId}`, productId, counter: lp.getCounter() })
    .then((result) => console.log(result));

}
