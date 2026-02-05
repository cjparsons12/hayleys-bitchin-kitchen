import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.ADMIN_PASSWORD;

if (!JWT_SECRET) {
  throw new Error('ADMIN_PASSWORD environment variable is required');
}

export const generateToken = () => {
  return jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '30d' });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const validatePassword = (password) => {
  return password === process.env.ADMIN_PASSWORD;
};
