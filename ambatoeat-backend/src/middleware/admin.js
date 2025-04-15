const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
      return next();
    }
    
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Admin role required.' 
    });
  };
  
  module.exports = isAdmin;