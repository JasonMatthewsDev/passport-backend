import bodyParser from 'body-parser';
import conf from 'dotenv-safe';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import WebSocket from 'ws';

import { Factory } from './models';

conf.config();

const { PORT, WS_PORT, DB_USER, DB_PASS, DB_URL, DB_NAME, NODE_ENV } = process.env;
const wss = new WebSocket.Server({ port: WS_PORT });

wss.on('connection', async ws => {
  mongoose.connect(`mongodb://${DB_USER}:${DB_PASS}@${DB_URL}/${DB_NAME}`, { useNewUrlParser: true });

  //Send all factories when websocket connects. Could just be done with a rest api endpoint.
  const Factories = await Factory.getAllFactories();
  ws.send(JSON.stringify({ Factories }));
});

const pushFactoryTree = async () => {
  const Factories = await Factory.getAllFactories();
  wss.clients.forEach(client => client.send(JSON.stringify({Factories})));
};

const server = express();

//Prod will serve assets from the public dir and have the same origin. This is just for a convenient development experience
if (NODE_ENV === 'developement') {
  server.use(cors());
}
server.use(express.static(path.resolve(__dirname, '..', 'public')));
server.use(bodyParser.json());

server.post('/factory', async (req, res) => {
  try {
    await Factory.createFactory(req.body);
    pushFactoryTree();
    res.sendStatus(201);
  } catch (e) {
    res.status(500);
    res.send(JSON.stringify({error: `Failed to create new Factory: ${e.message}`}));
  }
});

server.put('/factory', async (req, res) => {
  try {
    await Factory.updateFactory(req.body);
    pushFactoryTree();
    res.sendStatus(202);
  } catch (e) {
    res.status(500);
    res.send(JSON.stringify({error: `Failed to update factory ${e.message}`}));
  }
});

server.delete('/factory', async (req, res) => {
  try {
    await Factory.deleteFactory(req.body);
    pushFactoryTree();
    res.sendStatus(202);
  } catch (e) {
    res.status(500);
    res.send(JSON.stringify({error: `Failed to delete factory ${e.message}`}));
  }
});

server.listen(PORT, () => console.log(`listening on port ${PORT}. Websocket on ${WS_PORT}`));
