// ============================================================
// Aegis Auth Middleware — Mock JWT Implementation
// ⚠️  DEMO/PROTOTYPE — Uses hardcoded tokens for demonstration
// Replace with real JWT (jsonwebtoken) validation in production
// ============================================================

/**
 * Pre-defined demo tokens mapped to user profiles.
 * In production: verify RS256-signed JWT against public key.
 */
const DEMO_TOKENS = {
  'demo-token-admin': {
    id: 'usr_admin_001',
    name: 'Admin User',
    email: 'admin@aegis.maha.gov.in',
    role: 'admin',
    district: null,            // admin sees all districts
    permissions: ['read', 'write', 'delete', 'export', 'alerts'],
  },
  'demo-token-analyst': {
    id: 'usr_analyst_001',
    name: 'Risk Analyst',
    email: 'analyst@aegis.maha.gov.in',
    role: 'analyst',
    district: null,
    permissions: ['read', 'write', 'export'],
  },
  'demo-token-viewer': {
    id: 'usr_viewer_001',
    name: 'Field Viewer',
    email: 'viewer@aegis.maha.gov.in',
    role: 'viewer',
    district: 'Pune',
    permissions: ['read'],
  },
  'demo-token-collector': {
    id: 'usr_collector_001',
    name: 'Data Collector',
    email: 'collector@aegis.maha.gov.in',
    role: 'data_collector',
    district: 'Raigad',
    permissions: ['read', 'write'],
  },
};

/**
 * requireAuth middleware
 * Reads token from Authorization header: "Bearer <token>"
 * Sets req.user on success; returns 401/403 on failure.
 */
const requireAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : authHeader.trim();

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Provide: Authorization: Bearer <token>',
      hint: 'Demo tokens: demo-token-admin | demo-token-analyst | demo-token-viewer',
    });
  }

  const user = DEMO_TOKENS[token];
  if (!user) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token.',
      hint: 'Demo tokens: demo-token-admin | demo-token-analyst | demo-token-viewer',
    });
  }

  // Attach user to request for downstream handlers
  req.user = {
    ...user,
    token,
    authenticatedAt: new Date().toISOString(),
    mode: 'mock-demo',
  };

  next();
};

/**
 * requireRole middleware factory
 * Usage: router.get('/admin', requireAuth, requireRole('admin'), handler)
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`,
    });
  }
  next();
};

/**
 * requirePermission middleware factory
 * Usage: router.delete('/item', requireAuth, requirePermission('delete'), handler)
 */
const requirePermission = (permission) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  if (!req.user.permissions.includes(permission)) {
    return res.status(403).json({
      success: false,
      message: `Permission denied. Required: "${permission}". Your role "${req.user.role}" lacks this permission.`,
    });
  }
  next();
};

/**
 * optionalAuth middleware
 * Attaches req.user if a valid token is present, but does NOT block the request.
 * Useful for routes that work for both authenticated and anonymous users.
 */
const optionalAuth = (req, _res, next) => {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : authHeader.trim();

  if (token && DEMO_TOKENS[token]) {
    req.user = { ...DEMO_TOKENS[token], token, mode: 'mock-demo' };
  }
  next();
};

module.exports = { requireAuth, requireRole, requirePermission, optionalAuth, DEMO_TOKENS };
