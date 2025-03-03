import express from 'express';
import cors from 'cors';
import { notFoundHandler, errorHandler } from './middlewares/error-handler.js';
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

// API:n juuri
app.get('/api/', (req, res) => {
  console.log('GET-pyyntö API:n juureen havaittu');
  res.send('Welcome to my REST API!');
});

// 404 virheitä varten
app.use(notFoundHandler);
// yleinen virhevastausten lähettäjä kaikkia virhetilanteita varten
app.use(errorHandler);


// Palvelimen käynnistys lopuksi kaikkien määritelmien jälkeen
app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);

});
