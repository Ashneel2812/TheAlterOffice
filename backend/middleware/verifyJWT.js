require('dotenv').config();

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("Auth header received:", authHeader);
  console.log("JWT_SECRET used for verification:", JWT_SECRET);
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    console.log("Extracted token:", token);
    
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error("JWT verification error:", err);
        return res.status(403).json({ message: 'Forbidden' });
      }
      if (!decoded) {
        console.error("Decoded token is undefined");
        return res.status(403).json({ message: 'Forbidden: Token decoding failed' });
      }
      // Ensure the decoded token contains the 'id' property
      if (!decoded.id) {
        console.error("Token payload missing 'id' property:", decoded);
        return res.status(403).json({ message: 'Forbidden: Token payload invalid' });
      }
      console.log("JWT successfully verified. Decoded payload:", decoded);
      req.user = decoded;
      next();
    });
  } else {
    console.error("No authorization header found or token not in correct format.");
    res.status(401).json({ message: 'Unauthorized' });
  }
};
