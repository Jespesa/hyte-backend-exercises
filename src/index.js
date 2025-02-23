import express from 'express';
import cors from 'cors';
import { addItem, deleteItem, editItem, getItemById, getItems } from './items.js';

import authRouter from './routes/auth-router.js';
import entryRouter from './routes/entry-router.js';
import userRouter from './routes/user-router.js';

const hostname = '127.0.0.1';
const port = 3000;
const app = express();

// Middleware asetetaan ensin
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Reitit lisätään middlewarejen jälkeen
app.use('/api/entries', entryRouter);
app.use('/api/users', userRouter);
app.use('/api/auth', authRouter);

// Staattinen HTML-sivusto
app.use('/', express.static('public'));

// Mock-data testireitit
app.get('/api/items', getItems);
app.get('/api/items/:id', getItemById);
app.post('/api/items', addItem);
app.put('/api/items/:id', editItem);
app.delete('/api/items/:id', deleteItem);

// API:n juuri
app.get('/api/', (req, res) => {
  console.log('GET-pyyntö API:n juureen havaittu');
  res.send('Welcome to my REST API!');
});

// Palvelimen käynnistys
app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
