// src/index.js
import express from 'express';
import { getItems, getItemById, addItem, updateItem, deleteItem } from './items.js';
import { getUsers, getUserById, addUser, loginUser } from './users.js';

const hostname = '127.0.0.1';
const app = express();
const port = 3001;

// middleware
app.use(express.json());
app.use('/', express.static('public'));

// Items endpoints
app.get('/api/items', getItems);
app.get('/api/items/:id', getItemById);
app.post('/api/items', addItem);
app.put('/api/items/:id', updateItem);
app.delete('/api/items/:id', deleteItem);

// Users endpoints
app.get('/api/users', getUsers);
app.get('/api/users/:id', getUserById);
app.post('/api/users', addUser);
app.post('/api/login', loginUser);

// API root endpoint
app.get('/api/', (req, res) => {
  console.log('get-pyyntö apin juureen havaittu');
  console.log(req.url);
  res.send('Welcome to my REST API!');
});

// Route parameters example
app.get('/api/sum/:num1/:num2', (req, res) => {
  console.log(req.params);
  const num1 = Number(req.params.num1);
  const num2 = Number(req.params.num2);
  
  if(isNaN(num1) || isNaN(num2)) {
    res.status(400);
    res.json({
      error: 'Both parameters must be numbers!'
    });
    return;
  }
  
  res.json({
    num1,
    num2,
    sum: num1 + num2
  });
});

// Query parameters example
app.get('/api/sum/', (req, res) => {
  console.log(req.query);
  const num1 = parseInt(req.query.num1);
  const num2 = parseInt(req.query.num2);
  res.json({
    num1,
    num2,
    sum: num1 + num2
  });
});

// POST example
app.post('/api/moro', (req, res) => {
  console.log(req.body);
  res.status(200);
  res.json({reply: 'no Moro ' + req.body.sender});
});

// Start the server (only once)
app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});