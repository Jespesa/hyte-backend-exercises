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
    console.log('item found:', item)
    // jos item löytyi, eli arvo ei ole undefined
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({message: "Item not found"});
    }
  };
  
  // itemin lisääminen
  const addItem = (req, res) => {
    console.log('addItem request body', req.body);
    // jos pyyntö sisältää name-ominaisuuden, lisätään uusi asia items-taulukkoon
    if (req.body.name) {
      // generoidaan id-numero uudelle asialle (yhtä suurempi kuin viimeisin)
      const latestId = items[items.length-1].id
      // luodaan uusi asia olio ja lisätään se items-taulukkoon
      const newItem = {id: latestId + 1, name: req.body.name};
      items.push(newItem);
      res.status(201);
      return res.json({message: 'Item added.'});
    }
    res.status(400);
    return res.json({message: 'Request is missing name property.'});
  };
  
  
  // TODO: put & delete endpoints
  // TODO: lisää users.js, ks. materiaali week 2
  
  export {getItems, getItemById, addItem};