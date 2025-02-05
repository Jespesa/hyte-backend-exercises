import express from 'express';
import { getUsers, getUserById, addUser, loginUser, deleteUser, login, editUser,  } from '../controllers/user-controller.js';
const userRouter = express.Router();

userRouter
.get('/', getUsers)
.get('/:id', getUserById)
.post('/', addUser)
.put('/:id', editUser)
.delete('/:id', deleteUser)
.post('/login', loginUser)
.post('/login', login);

export default userRouter;