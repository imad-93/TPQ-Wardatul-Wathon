// Mock middleware for development
export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  // TODO: Implement JWT verification
  next();
};

export const adminOnly = (req, res, next) => {
  // TODO: Check user role from JWT
  next();
};

export const errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: {
      message: err.message,
      status: err.status || 500
    }
  });
};
