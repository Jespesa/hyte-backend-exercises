// mock data (tilapäistä testidataa)
const items = [
  { id: 1, name: 'Omena' },
  { id: 2, name: 'Appelsiini' },
  { id: 3, name: 'Porkkana' },
  { id: 4, name: 'Mandariini' },
];

// kaikkien itemien haku
const getItems = (req, res) => {
  res.json(items);
};

// itemin haku id:n perusteella
const getItemById = (req, res) => {
  const item = items.find((item) => item.id == req.params.id);
  if (item) {
    res.json(item);
  } else {
    res.status(404).json({ message: 'Item not found' });
  }
};

// itemin lisääminen
const addItem = (req, res) => {
  if (req.body.name) {
    const latestId = items[items.length - 1]?.id || 0;
    const newItem = { id: latestId + 1, name: req.body.name };
    items.push(newItem);
    res.status(201).json({ message: 'Item added.', item: newItem });
  } else {
    res.status(400).json({ message: 'Request is missing name property.' });
  }
};



// TODO: put & delete endpoints
// TODO: lisää users.js, ks. materiaali week 2

// itemin muokkaaminen (PUT)
const updateItem = (req, res) => {
  console.log('Request body:', req.body);
  console.log('Request params:', req.params);

  const id = parseInt(req.params.id);
  const item = items.find((item) => item.id === id);

  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }

  if (!req.body || !req.body.name) {
    return res.status(400).json({ message: 'Request is missing name property or body is invalid.' });
  }

  item.name = req.body.name;
  res.json({ message: 'Item updated.', item });
};

// itemin poistaminen (DELETE)
const deleteItem = (req, res) => {
  const id = parseInt(req.params.id);
  const index = items.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Item not found' });
  }

  const deletedItem = items.splice(index, 1)[0];
  res.json({ message: 'Item deleted.', item: deletedItem });
};

export { getItems, getItemById, addItem, updateItem, deleteItem };
