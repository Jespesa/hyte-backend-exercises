// src/users.js

const users = [
    { id: 1, username: "johndoe", password: "password1", email: "johndoe@example.com" },
    { id: 2, username: "janedoe", password: "password2", email: "janedoe@example.com" },
    { id: 3, username: "bobsmith", password: "password3", email: "bobsmith@example.com" }
  ];
  
  // Get all users
  const getUsers = (req, res) => {
    res.json(users);
  };
  
  // Get user by ID
  const getUserById = (req, res) => {
    const user = users.find(user => user.id == req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  };
  
  // Create a new user
  const addUser = (req, res) => {
    const { username, password, email } = req.body;
    if (username && password && email) {
      const newUser = {
        id: users[users.length - 1].id + 1, 
        username, 
        password, 
        email
      };
      users.push(newUser);
      res.status(201).json({ message: "User added", user: newUser });
    } else {
      res.status(400).json({ message: "Missing required fields" });
    }
  };
  
  // Dummy login endpoint
  const loginUser = (req, res) => {
    const { username, password } = req.body;
    const user = users.find(user => user.username === username && user.password === password);
    if (user) {
      res.json({ message: "Login successful", user: { id: user.id, username: user.username } });
    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }
  };
  
  export { getUsers, getUserById, addUser, loginUser };
  