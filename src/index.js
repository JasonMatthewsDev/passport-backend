import bodyParser from 'body-parser';
import conf from 'dotenv-safe';
import cors from 'cors';
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import path from 'path';

conf.config();

import { FactoryRouter } from './routers';
import { WebsocketService } from './services';

const { PORT, NODE_ENV, DB_USER, DB_PASS, DB_URL, DB_NAME } = process.env;

const app = express();
const server = http.createServer(app);

WebsocketService.start(server);
mongoose.connect(`mongodb://${DB_USER}:${DB_PASS}@${DB_URL}/${DB_NAME}`, { useNewUrlParser: true, autoReconnect: true });

//Prod will serve assets from the public dir and have the same origin. This is just for a convenient development experience
if (NODE_ENV === 'developement') {
  app.use(cors());
}
app.use(express.static(path.resolve(__dirname, '..', 'public')));
app.use(bodyParser.json());

app.use('/factory', FactoryRouter);

server.listen(PORT, () => console.log(`listening on port ${PORT}.`));