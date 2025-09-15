import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required but not set.");
}

// extract user from authorization header
export  function authenticateToken(req) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null; // no token
  }
  const token = authHeader.split(" ")[1];
  try {
    const user = jwt.verify(token, JWT_SECRET);
    return user; // { id, email, role, tenantSlug }
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return null;
  }
}

// rote check
export  function checkRole(user, ...allowedRoles) {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}
