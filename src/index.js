import express from 'express';
const hostname = 'localhost';
const app = express();
const port = 3000;

// Staattinen HTML-sivusto tarjoillaan palvelimen juuressa
app.use('/', express.static('public'));

// Middleware, joka lukee JSON-dataa POST-pyyntöjen rungosta (body)
app.use(express.json());

// Rest-apin resurssit tarjoillaan /api/ polun allla
app.get('/api/', (req, res) => {
  console.log('GET PYYNTÖ JUUREEN HAVAITTU');
  console.log(req.url);
  res.send('Welcome to my REST API!');
});

// Syötteen lukeminen query-parametreista
app.get('/api/sum', (req, res) => {
    console.log(req.query);
    const num1 = parseInt(req.query.num1);
    const num2 = parseInt(req.query.num2);
    
    // Tarkista, että parametrit ovat validit
    if (isNaN(num1) || isNaN(num2)) {
        return res.status(400).json({ error: 'Both num1 and num2 should be valid numbers.' });
    }

    res.json({ resultnum1: num1, num2, sum: num1 + num2 });
});

// POST-pyyntö /api/moro reitille
app.post('/api/moro', (req, res) => {
    if (!req.body.sender) {
        return res.status(400).json({ error: 'Sender field is required.' });
    }
    console.log(req.body);
    res.json({ reply: 'No moro ' + req.body.sender });
});

// Virheenkäsittely: jos ei löydy reittiä
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
