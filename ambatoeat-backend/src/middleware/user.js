const isUser = (req, res, next) => {
    if (req.user && (req.user.role === 'USER' || req.user.role === 'ADMIN')) {
      return next();
    }
    
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. User role required.' 
    });
  };
  
  module.exports = isUser;