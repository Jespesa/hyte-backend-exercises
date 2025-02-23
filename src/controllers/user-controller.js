import {deleteUserById, updateUserById, insertUser, selectAllUsers, selectUserById} from '../models/user-model.js';
import bcrypt from 'bcryptjs';

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
// lisätään parempi virheenkäsittely myöhemmin
const addUser = async (req, res) => {
  console.log('addUser request body', req.body);
  // esitellään 3 uutta muuttujaa, johon sijoitetaan req.body:n vastaavien propertyjen arvot
  const {username, password, email} = req.body;
  // tarkistetaan, että pyynnössä on kaikki tarvittavat tiedot
  if (username && password && email) {
    // luodaan selväkielisestä sanasta tiiviste, joka tallennetaan kantaan
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // luodaan uusi käyttäjä olio ja lisätään se tietokantaa käyttäen modelia
    const newUser = {
      username,
      password: hashedPassword,
      email,
    };
    try {
      const result = await insertUser(newUser);
      res.status(201);
      return res.json({message: 'User added. id: ' + result});
    } catch (error) {
      console.error(error.message);
      return res.status(400).json({message: 'DB error: ' + error.message});
    }
  }
  res.status(400);
  return res.json({
    message: 'Request should have username, password and email properties.',
  });
};

// Userin muokkaus id:n perusteella (todo: käytä databasea)
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

// Userin poisto id:n perusteella (TODO: käytä databasea)
const deleteUser = async (req, res) => {
  try {
    // Tarkista että käyttäjä poistaa vain omaa tiliään
    if (parseInt(req.params.id) !== req.user.user_id) {
      return res.status(403).json({ message: 'Can only delete own account' });
    }

    const result = await deleteUserById(req.params.id);
    if (result) {
      res.json({ message: 'User deleted.' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// käyttäjän päivitysfunktio

const updateUser = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    // Käyttäjä voi päivittää vain omia tietojaan
    if (parseInt(req.params.id) !== userId) {
      return res.status(403).json({message: 'Can only update own user info'});
    }
    
    // Kutsu model-funktiota päivitetyllä nimellä
    await updateUserById(userId, req.body);
    res.json({message: 'User updated successfully'});
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

export {updateUser, getUsers, getUserById, addUser, editUser, deleteUser};