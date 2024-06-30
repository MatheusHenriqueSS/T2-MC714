import express from "express"
import bodyParser from "body-parser"
import { JSONRPCServer } from "json-rpc-2.0";
import { LamportClock } from "./lamport.js";

const server = new JSONRPCServer();

// First parameter is a method name.
// Second parameter is a method itself.
// A method takes JSON-RPC params and returns a result.
// It can also return a promise of the result.
const loggingServiceUrl = "http://logging-service/json-rpc";
const lp = new LamportClock();

server.addMethod("processInvoice", async ({ productId, counter }) => {
  lp.update(counter)
  console.log('chegou invoice')
  // Log the sale to the logging service
  const logRequest = {
    jsonrpc: "2.0",
    method: "logging",
    params: { message: `Invoice processed for product ID: ${productId}`, productId, counter: lp.getCounter() },
    id: 1
  };

  try {
    const logResponse = await fetch(loggingServiceUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(logRequest)
    });

    const logResponseData = await logResponse.json();

    if (logResponseData.error) {
      throw new Error(logResponseData.error.message);
    }

    if (logResponseData.error) {
      throw new Error(logResponseData.error.message);
    }

    return { success: true, message: "Sale processed and logged successfully" };
  } catch (error) {
    return { success: false, message: error.message };
  }
})



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