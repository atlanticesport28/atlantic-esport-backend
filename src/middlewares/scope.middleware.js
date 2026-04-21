/**
 * Geographic Scope Middleware
 * Ensures the user has access to the requested region.
 */
const checkScope = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Super Admin (Level 5) has global access
  if (req.user.role_level === 5) return next();

  // Get requested scope from body or query
  const targetContinent = req.body.continent || req.query.continent;
  const targetCountry = req.body.country || req.query.country;

  // Level 4: Continental Admin
  if (req.user.role_level === 4) {
    if (targetContinent && targetContinent !== req.user.continent) {
      return res.status(403).json({ 
        error: 'Forbidden: You only have access to your continent',
        your_continent: req.user.continent 
      });
    }
  }

  // Level 3: Country Admin
  if (req.user.role_level === 3) {
    if (targetCountry && targetCountry !== req.user.country) {
      return res.status(403).json({ 
        error: 'Forbidden: You only have access to your country',
        your_country: req.user.country 
      });
    }
    // Also check continent consistency if both are provided
    if (targetContinent && targetContinent !== req.user.continent) {
      return res.status(403).json({ error: 'Forbidden: Continent mismatch' });
    }
  }

  // Level 2: Organizer (Managed own resources, scope check usually not needed here but can be added)
  
  next();
};

module.exports = checkScope;
