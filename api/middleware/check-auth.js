const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.header.authorization.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        throw err;
      }
      req.user = decoded;
      next();
    });
  } catch (error) {
    return res.status(401).json({
      message: 'Auth failed'
    });
  }
};