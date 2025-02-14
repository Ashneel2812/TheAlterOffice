module.exports = (req, res, next) => {
    console.log("req is",req)
    console.log("res is",res)
    if (req.isAuthenticated && req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
  };
  