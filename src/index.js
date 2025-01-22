import express from 'express';
import { getItems } from './items.js';
const hostname = '127.0.0.1';
const app = express();
const port = 3000;

// Staattinen html-sivusto tarjoillaan palvelimen juuressa
app.use('/', express.static('public'));

// middleware, joka lukee json data POST-pyyntöjen rungosta (body)
app.use(express.json());

// rest-apin resurssit tarjoillaan /api/-polun alla
app.get('/api/', (req, res) => {
  console.log('get-pyyntö juureen havaittu');
  console.log(req.url);
  res.send('Welcome to my REST API!');
});


//item resurssien päätepisteet
app.get ('/api/items', getItems);

// syötteen lukeminen reittiparametreista (route params)
app.get('/api/sum/:num1/:num2', (req, res) => {
  console.log(req.params);
  const num1 = Number(req.params.num1);
  const num2 = Number(req.params.num2);
  // testataan, jos jompikumpi luvuista ei ole numero, niin lähetään
  // virhetilakoodi ja viesti json-muodossa
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

// syötteen lukeminen kyselyparametreista (query params)
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


// POST-pynnön käsittely ja datan lukeminen pyynnön bodystä
app.post('/api/moro', (req, res) => {
  console.log(req.body);
  res.status(200);
  res.json({reply: 'no Moro ' + req.body.sender});
});

// TODO: lisää oma reitti ja toiminnallisuus omaa mielikuvitusta käyttäen, niin
// ensimmäisen viikon harkka ok

// nykyisen päivämäärän ja kellonajan palautus
app.get('/api/time', (req, res) => {
  res.json({ currentTime: new Date().toISOString() });
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});