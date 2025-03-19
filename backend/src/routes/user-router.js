import express from 'express';
import {body} from 'express-validator';
import {
  addUser,
  getUserById,
  getUsers,
  updateUser,
  deleteUser,
} from '../controllers/user-controller.js';
import {authenticateToken} from '../middlewares/authentication.js';
import { validationErrorHandler } from '../middlewares/error-handler.js';
const userRouter = express.Router();

// all routes to /api/users
userRouter
.route('/')
// only logged in user can fetch the user list
  .get(authenticateToken, getUsers)
  .post(
    body('email').trim().isEmail(),
    body('username').trim().isLength({min: 3, max: 20}).isAlphanumeric(),
    body('password').trim().isLength({min: 8, max:64}),
    validationErrorHandler,
    addUser);

// all routes to /api/users/:id
userRouter.route('/:id')
  .get(getUserById)
  .put(authenticateToken, updateUser)
  .delete(authenticateToken, deleteUser);

export default userRouter;