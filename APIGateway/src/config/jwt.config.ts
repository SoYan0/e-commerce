export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'auth-service-jwt-secret-2024',
  signOptions: { expiresIn: '1h' },
};

// Log the JWT secret being used (for debugging)
console.log(`JWT Config - Secret: ${jwtConfig.secret.substring(0, 20)}...`);
console.log(`JWT Config - Environment JWT_SECRET: ${process.env.JWT_SECRET || 'NOT_SET'}`);
