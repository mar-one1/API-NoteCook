const jwt = require('jsonwebtoken');
// Secret key used to sign and verify tokens
const User = require('../Model/User');
const { Error } = require('sequelize');
const secretKey = process.env.JWT_SECRET;

function verifyToken(req, res, next) {
  const authToken = req.headers.authorization;

  if (!authToken) {
    return res.status(403).json({ error: 'Authorization token not provided' });
  }

  const token = authToken.replace('Bearer ', '');

  jwt.verify(token, secretKey, (err, decoded) => {
    let userInfo;

    if (err) {
      if (err.name === 'TokenExpiredError') {
        const expiredDecoded = jwt.decode(token);

        if (!expiredDecoded) {
          return res.status(400).json({ error: 'Token is invalid and cannot be refreshed' });
        }

        userInfo = expiredDecoded;

        const newAccessToken = jwt.sign(
          { id: userInfo.id, username: userInfo.username },
          secretKey,
          { expiresIn: '1h' }
        );

        req.headers.authorization = `Bearer ${newAccessToken}`;
        req.newAccessToken = newAccessToken;
        req.tokenRefreshed = true;
        req.user = userInfo;
      } else {
        return res.status(401).json({ error: 'Token is invalid' });
      }
    } else {
      userInfo = decoded;
      req.user = decoded;
    }

    // Check if the user exists in the database
    User.getUserByUsername(userInfo.username, (err, user) => {
      if (err) {
        console.error('Database error while verifying user:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!user) {
        return res.status(401).json({ error: 'User associated with this token does not exist' });
      }

      req.user = user; // Optionally attach the full user object
      next();
    });
  });
}

module.exports = verifyToken;
