import WebSocket from 'ws';

import { Factory } from '../../models';

let wss;

//Attach the connection listener
const start = server => {
  wss = new WebSocket.Server({ server });

  //This doesn't scale beyond one server with this implementation. There would have to be another actor in place to assist with scaling.
  //Some kind of a pub/sub broker like a message queue
  wss.on('connection', async ws => {
    //Send all factories when websocket connects. Could just be done with a rest api endpoint instead.
    const Factories = await Factory.getAllFactories();
    ws.send(JSON.stringify({ Factories }));
  });
}

//Pushes tree out to all clients
const pushFactoryTree = async () => {
  const Factories = await Factory.getAllFactories();
  wss.clients.forEach(client => client.send(JSON.stringify({Factories})));
};

export default {
  pushFactoryTree,
  start
};
