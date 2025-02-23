import express from 'express';
import {
  addUser,
  getUserById,
  getUsers,
  updateUser,
  deleteUser,
} from '../controllers/user-controller.js';
import {authenticateToken} from '../middlewares/authentication.js';
const userRouter = express.Router();

// all routes to /api/users
userRouter.route('/')
  .get(authenticateToken, getUsers)
  .post(addUser);

// all routes to /api/users/:id
userRouter.route('/:id')
  .get(getUserById)
  .put(authenticateToken, updateUser)
  .delete(authenticateToken, deleteUser);
export default userRouter;