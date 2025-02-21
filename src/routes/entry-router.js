import express from 'express';
import {postEntry} from '../controllers/entry-controller.js';
import {authenticateToken} from '../middlewares/authentication.js';
import {getEntries} from '../controllers/entry-controller.js';

const entryRouter = express.Router();

// post to /api/entries
entryRouter
  .route('/')
  .post(authenticateToken, postEntry)
  .get(authenticateToken, getEntries);

export default entryRouter;
