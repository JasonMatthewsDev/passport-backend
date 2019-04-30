import { Router } from 'express';

import { Factory } from '../../models';
import { WebsocketService } from '../../services';

const router = Router();

//Create factory end point
router.post('/', async ({ body }, res) => {
  try {
    await Factory.createFactory(body);
    WebsocketService.pushFactoryTree();
    res.sendStatus(201);
  } catch (e) {
    res.status(500);
    res.send(JSON.stringify({error: `Failed to create new Factory: ${e.message}`}));
  }
});

//Update factory endpoint. Patch verb because the end point is not idempotent.
//Put would be appropriate if replacing the entire document
router.patch('/:id', async ({ params: { id }, body }, res) => {
  try {
    await Factory.updateFactory(id, body);
    WebsocketService.pushFactoryTree();
    res.sendStatus(202);
  } catch (e) {
    res.status(500);
    res.send(JSON.stringify({error: `Failed to update factory ${e.message}`}));
  }
});

//Delete factory endpoint.
router.delete('/:id', async ({ params: { id }}, res) => {
  try {
    await Factory.deleteFactory(id);
    WebsocketService.pushFactoryTree();
    res.sendStatus(202);
  } catch (e) {
    res.status(500);
    res.send(JSON.stringify({error: `Failed to delete factory ${e.message}`}));
  }
});

export default router;