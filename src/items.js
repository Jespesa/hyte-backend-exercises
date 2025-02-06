// mock data (tilapäistä testidataa)
const items = [
  {id: 1, name: 'Omena'},
  {id: 2, name: 'Appelsiini'},
  {id: 3, name: 'Porkkana'},
  {id: 4, name: 'Mandariini'},
];

// kaikkien itemien haku
const getItems = (req, res) => {
  res.json(items);
};

// itemin haku id:n perusteella
const getItemById = (req, res) => {
  console.log('getItemById', req.params.id);
  const item = items.find((item) => item.id == req.params.id);
  console.log('item found:', item);
  // jos item löytyi, eli arvo ei ole undefined
  if (item) {
    res.json(item);
  } else {
    res.status(404).json({message: 'Item not found'});
  }
};

// itemin lisääminen
const addItem = (req, res) => {
  console.log('addItem request body', req.body);
  // jos pyyntö sisältää name-ominaisuuden, lisätään uusi asia items-taulukkoon
  if (req.body.name) {
    // generoidaan id-numero uudelle asialle (yhtä suurempi kuin viimeisin)
    const latestId = items[items.length - 1].id;
    // luodaan uusi asia olio ja lisätään se items-taulukkoon
    const newItem = {id: latestId + 1, name: req.body.name};
    items.push(newItem);
    res.status(201);
    return res.json({message: 'Item added.'});
  }
  res.status(400);
  return res.json({message: 'Request is missing name property.'});
};

// itemin muokkaus id:n perusteella
const editItem = (req, res) => {
  console.log('editItem request body', req.body);
  const item = items.find((item) => item.id == req.params.id);
  if (item) {
    item.name = req.body.name;
    res.json({message: 'Item updated.'});
  } else {
    res.status(404).json({message: 'Item not found'});
  }
};

// itemin poisto id:n perusteella
const deleteItem = (req, res) => {
  console.log('deleteItem', req.params.id);
  const index = items.findIndex((item) => item.id == req.params.id);
  //console.log('index', index);
  // findIndex returns -1 if item is not found
  if (index !== -1) {
    // remove one item from array based on index
    items.splice(index, 1);
    res.json({message: 'Item deleted.'});
  } else {
    res.status(404).json({message: 'Item not found'});
  }
};

export {getItems, getItemById, addItem, editItem, deleteItem};