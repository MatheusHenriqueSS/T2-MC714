import express from "express"
import bodyParser from "body-parser"
import { JSONRPCServer } from "json-rpc-2.0";

const server = new JSONRPCServer();

// First parameter is a method name.
// Second parameter is a method itself.
// A method takes JSON-RPC params and returns a result.
// It can also return a promise of the result.

const skus = {};

server.addMethod("logging", ({ message, productId, counter }) => {
  console.log('message received: ', message);
  if (!skus[productId]) skus[productId] = [];
  skus[productId].push({ message, productId, counter });

  if (skus[productId].length === 3) {
    console.log('logging results:')
    skus[productId].sort(function (a, b) {
      return a.counter - b.counter
    }).forEach((obj) => console.log(obj.message))

  }
});
// server.addMethod("log", ({ message }) => console.log(message));

const app = express();
app.use(bodyParser.json());

app.post("/json-rpc", (req, res) => {
  const jsonRPCRequest = req.body;
  // server.receive takes a JSON-RPC request and returns a promise of a JSON-RPC response.
  // It can also receive an array of requests, in which case it may return an array of responses.
  // Alternatively, you can use server.receiveJSON, which takes JSON string as is (in this case req.body).
  server.receive(jsonRPCRequest).then((jsonRPCResponse) => {
    if (jsonRPCResponse) {
      res.json(jsonRPCResponse);
    } else {
      // If response is absent, it was a JSON-RPC notification method.
      // Respond with no content status (204).
      res.sendStatus(204);
    }
  });
});

app.listen(80);