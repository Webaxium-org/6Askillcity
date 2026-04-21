import jwt from 'jsonwebtoken';

const generateToken = (id, rememberMe = false) => {
  const days = rememberMe ? 3 : 1;
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: `${days}d`,
  });
};

export default generateToken;
