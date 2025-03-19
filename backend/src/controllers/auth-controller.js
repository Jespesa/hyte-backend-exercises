import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import {selectUserByUsername} from '../models/user-model.js';
import { customError } from '../middlewares/error-handler.js';

// user authentication (login)
const login = async (req, res, next) => {
  const {username, password} = req.body;
  if (!username) {
    return next(customError('Username is missing', 400));
  }
  const user = await selectUserByUsername(username);
  if (user) {
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      const token = jwt.sign(user, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });
      return res.json({message: 'login ok', user, token});
    }
  }
 
  return next(customError('Bad username/password.', 401));
  
}

const getMe = (req, res) => {
  const user = req.user;
  res.json(user);
};

export {login, getMe};