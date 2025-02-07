import {insertUser, selectAllUsers, selectUserById, selectUserByNameAndPassword} from '../models/user-model.js';

// kaikkien käyttäjätietojen haku
const getUsers = async (req, res) => {
  // in real world application, password properties should never be sent to client
  const users = await selectAllUsers();
  res.json(users);
};

// Userin haku id:n perusteella
const getUserById = async (req, res) => {
  console.log('getUserById', req.params.id);

  try {
    const user = await selectUserById(req.params.id);
    console.log('User found:', user);
    // jos user löytyi, eli arvo ei ole undefined, lähetetään se vastauksena
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({message: 'User not found'});
    }
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

// käyttäjän lisäys (rekisteröinti)
// lisätään virheenkäsittely myöhemmin
const addUser = async (req, res) => {
  console.log('addUser request body', req.body);
  // esitellään 3 uutta muuttujaa, johon sijoitetaan req.body:n vastaavien propertyjen arvot
  const {username, password, email} = req.body;
  // tarkistetaan, että pyynnössä on kaikki tarvittavat tiedot
  if (username && password && email) {
    // luodaan uusi käyttäjä olio ja lisätään se tietokantaa käyttäen modelia
    const newUser = {
      username,
      password,
      email,
    };
    const result = await insertUser(newUser);
    res.status(201);
    return res.json({message: 'User added. id: ' + result});
  }
  res.status(400);
  return res.json({
    message: 'Request should have username, password and email properties.',
  });
};

// Userin muokkaus id:n perusteella
const editUser = (req, res) => {
  console.log('editUser request body', req.body);
  const user = users.find((user) => user.id == req.params.id);
  if (user) {
    user.username = req.body.username;
    user.password = req.body.password;
    user.email = req.body.email;
    res.json({message: 'User updated.'});
  } else {
    res.status(404).json({message: 'User not found'});
  }
};

// Userin poisto id:n perusteella
const deleteUser = (req, res) => {
  console.log('deleteUser', req.params.id);
  const index = users.findIndex((user) => user.id == req.params.id);
  //console.log('index', index);
  // findIndex returns -1 if user is not found
  if (index !== -1) {
    // remove one user from array based on index
    users.splice(index, 1);
    res.json({message: 'User deleted.'});
  } else {
    res.status(404).json({message: 'User not found'});
  }
};

// user authentication (login)
const login = async (req, res) => {
  const {username, password} = req.body;
  if (!username) {
    return res.status(401).json({message: 'Username missing.'});
  }
  const user = await selectUserByNameAndPassword(username, password);
  if (user) {
    res.json({message: 'login ok', user});
  } else {
    res.status(401).json({message: 'Bad username/password.'});
  }
};

export {getUsers, getUserById, addUser, editUser, deleteUser, login};