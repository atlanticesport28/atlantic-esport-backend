/**
 * Hierarchical RBAC Middleware
 * @param {number} minLevel - Minimum role level required (1-5)
 * @param {string} requiredPermission - Optional specific permission required
 */
const authorize = (minLevel = 1, requiredPermission = null) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: No user profile' });
    }

    // Level 5 (Super Admin) bypasses everything
    if (req.user.role_level === 5) return next();

    // Check Role Level Hierarchy
    const hasLevel = req.user.role_level >= minLevel;
    
    // Check Permission (if specified)
    const hasPermission = !requiredPermission || (req.user.permissions && req.user.permissions.includes(requiredPermission));

    if (!hasLevel && !hasPermission) {
      return res.status(403).json({ 
        error: 'Forbidden: Insufficient role level or missing permission',
        required: { minLevel, permission: requiredPermission },
        current: { level: req.user.role_level, role: req.user.role }
      });
    }

    next();
  };
};

module.exports = authorize;
