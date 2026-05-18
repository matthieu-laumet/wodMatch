const validateProtectedRoutes = (allowedRoutes) => {
  return (req, res, next) => {
    const isAllowedRoute = allowedRoutes.some(route => {
      if (route instanceof RegExp) {
        return route.test(req.path);
      }
      return req.path === route || req.path.startsWith(route + '/');
    });
    
    if (!isAllowedRoute) {
      return res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
    }
    
    next();
  };
};

module.exports = validateProtectedRoutes;