import express from 'express';
import {
  addUser,
  deleteUser,
  editUser,
  getUserById,
  getUsers,
  login,
} from '../controllers/user-controller.js';
const userRouter = express.Router();

// all routes to /api/users
userRouter.route('/')
  .get(getUsers)
  .post(addUser);

// all routes to /api/users/:id
userRouter.route('/:id')
  .get(getUserById)
  .put(editUser)
  .delete(deleteUser);

// post to /api/users/login
userRouter.post('/login', login);

export default userRouter;