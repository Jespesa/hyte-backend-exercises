import {getAllUsers} from '../models/user-model.js';

// kaikkien käyttäjätietojen haku
const getUsers = async (req, res) => {
  // in real world application, password properties should never be sent to client
  const users = await getAllUsers();
  res.json(users);
};

// Userin haku id:n perusteella
const getUserById = (req, res) => {
  console.log('getUserById', req.params.id);
  const user = users.find((user) => user.id == req.params.id);
  console.log('User found:', user);
  // jos user löytyi, eli arvo ei ole undefined, lähetetään se vastauksena
  if (user) {
    // exclude password property from user object before sending it to client
    const {id, username, email} = user;
    res.json({id, username, email});
    // other option: const {password, ...userWithoutPassword} = user;
    // res.json(userWithoutPassword);
  } else {
    res.status(404).json({message: 'User not found'});
  }
};

// käyttäjän lisäys (rekisteröinti)
const addUser = (req, res) => {
  console.log('addUser request body', req.body);
  // esitellään 3 uutta muuttujaa, johon sijoitetaan req.body:n vastaavien propertyjen arvot
  const {username, password, email} = req.body;
  // tarkistetaan, että pyynnössä on kaikki tarvittavat tiedot
  if (username && password && email) {
    // generoidaan id-numero uudelle käyttäjälle (yhtä suurempi kuin viimeisin)
    const latestId = users[users.length - 1].id;
    // luodaan uusi käyttäjä olio ja lisätään se users-taulukkoon
    const newUser = {
      id: latestId + 1,
      username,
      password,
      email,
    };
    users.push(newUser);
    res.status(201);
    return res.json({message: 'User added.'});
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
const login = (req, res) => {
  const {username, password} = req.body;
  if (!username) {
    return res.status(401).json({message: 'Username missing.'});
  }
  const user = users.find((user) => user.username === username);
  // jos user-olio löytyy ja sen password-ominaisuus täsmää requestissa
  // lähetetyn password:n arvon kanssa, lähetetään vastauksessa viesti ja
  // löydetyn käyttäjän kaikki tiedot
  if (user && user.password === password) {
    // TO BE FIXED: password property should never be sent to client
    res.json({message: 'login ok', user});
  } else {
    res.status(401).json({message: 'Bad username/password.'});
  }
};

export {getUsers, getUserById, addUser, editUser, deleteUser, login};