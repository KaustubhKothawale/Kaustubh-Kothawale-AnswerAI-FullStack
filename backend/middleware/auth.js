import jwt  from 'jwt-simple';
import { User } from '../models/User.js';
import { config } from '../config.js';

export const auth = async (req, res, next) => {
  // console.log("auth middleware called", req.headers);
  const token = req.headers['authorization'];
  // console.log("token",token);
  if (!token) return res.status(401).send('Unauthorized: No token provided');

  try {
    const decoded = jwt.decode(token, config.secretKey);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).send('Unauthorized: Invalid token');

    req.user = user;
    // console.log("user",user);
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).send('Unauthorized: Invalid token');
  }
};
