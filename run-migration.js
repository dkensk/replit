// Run database migration on startup
const { execSync } = require('child_process');

try {
  console.log('Running database migration...');
  execSync('npx drizzle-kit push', { stdio: 'inherit' });
  console.log('Database migration complete');
} catch (error) {
  console.error('Migration failed (non-fatal):', error.message);
  // Continue anyway - tables might already exist
}

