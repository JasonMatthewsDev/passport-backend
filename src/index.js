import bodyParser from 'body-parser';
import conf from 'dotenv-safe';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';

conf.config();

import { FactoryRouter } from './routers';
import { WebsocketService } from './services';

const { PORT, NODE_ENV, DB_USER, DB_PASS, DB_URL, DB_NAME } = process.env;

const server = express();

WebsocketService.start(server);
mongoose.connect(`mongodb://${DB_USER}:${DB_PASS}@${DB_URL}/${DB_NAME}`, { useNewUrlParser: true, autoReconnect: true });

//Prod will serve assets from the public dir and have the same origin. This is just for a convenient development experience
if (NODE_ENV === 'developement') {
  server.use(cors());
}
server.use(express.static(path.resolve(__dirname, '..', 'public')));
server.use(bodyParser.json());

server.use('/factory', FactoryRouter);

server.listen(PORT, () => console.log(`listening on port ${PORT}.`));
