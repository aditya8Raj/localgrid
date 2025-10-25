#!/usr/bin/env node

/**
 * LocalGrid Setup Verification Script
 * Checks if all required configurations are in place
 */

const fs = require('fs');
const path = require('path');

const checks = {
  passed: [],
  failed: [],
  warnings: []
};

console.log('\n🔍 LocalGrid Setup Verification\n');
console.log('='.repeat(50));

// Check 1: .env file exists
function checkEnvFile() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    checks.passed.push('✅ .env file exists');
    
    // Check required variables
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const requiredVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
      'EMAIL_SMTP_HOST',
      'EMAIL_SMTP_USER',
      'UPSTASH_REDIS_REST_URL'
    ];
    
    requiredVars.forEach(varName => {
      if (envContent.includes(varName)) {
        checks.passed.push(`  ✅ ${varName} configured`);
      } else {
        checks.failed.push(`  ❌ ${varName} missing`);
      }
    });
  } else {
    checks.failed.push('❌ .env file not found');
  }
}

// Check 2: Prisma client generated
function checkPrismaClient() {
  const prismaPath = path.join(__dirname, 'node_modules', '@prisma', 'client');
  if (fs.existsSync(prismaPath)) {
    checks.passed.push('✅ Prisma client exists');
  } else {
    checks.failed.push('❌ Prisma client not generated. Run: npx prisma generate');
  }
}

// Check 3: Database schema exists
function checkDatabaseSchema() {
  const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
  if (fs.existsSync(schemaPath)) {
    checks.passed.push('✅ Prisma schema exists');
    
    const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
    const requiredModels = ['User', 'Listing', 'Booking', 'Review', 'CommunityProject'];
    
    requiredModels.forEach(model => {
      if (schemaContent.includes(`model ${model}`)) {
        checks.passed.push(`  ✅ ${model} model defined`);
      } else {
        checks.failed.push(`  ❌ ${model} model missing`);
      }
    });
  } else {
    checks.failed.push('❌ Prisma schema not found');
  }
}

// Check 4: Key files exist
function checkKeyFiles() {
  const keyFiles = [
    'src/lib/auth.ts',
    'src/lib/prisma.ts',
    'src/lib/permissions.ts',
    'src/lib/geo.ts',
    'src/lib/redis.ts',
    'src/middleware.ts',
    'src/app/auth/signup/page.tsx',
    'src/services/email.ts'
  ];
  
  keyFiles.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      checks.passed.push(`✅ ${filePath}`);
    } else {
      checks.failed.push(`❌ ${filePath} missing`);
    }
  });
}

// Check 5: Dependencies installed
function checkDependencies() {
  const packageJsonPath = path.join(__dirname, 'package.json');
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  
  if (fs.existsSync(packageJsonPath) && fs.existsSync(nodeModulesPath)) {
    checks.passed.push('✅ Dependencies installed');
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const criticalDeps = [
      'next',
      '@prisma/client',
      'next-auth',
      'bcryptjs',
      'bullmq',
      'ioredis',
      'leaflet',
      'react-leaflet',
      'nodemailer'
    ];
    
    criticalDeps.forEach(dep => {
      if (packageJson.dependencies[dep]) {
        checks.passed.push(`  ✅ ${dep} installed`);
      } else {
        checks.warnings.push(`  ⚠️  ${dep} not in dependencies`);
      }
    });
  } else {
    checks.failed.push('❌ Dependencies not installed. Run: npm install');
  }
}

// Check 6: Migrations directory
function checkMigrations() {
  const migrationsPath = path.join(__dirname, 'prisma', 'migrations');
  if (fs.existsSync(migrationsPath)) {
    const migrations = fs.readdirSync(migrationsPath).filter(f => f !== 'migration_lock.toml');
    checks.passed.push(`✅ ${migrations.length} migration(s) found`);
  } else {
    checks.warnings.push('⚠️  No migrations directory found');
  }
}

// Check 7: TypeScript configuration
function checkTypeScript() {
  const tsconfigPath = path.join(__dirname, 'tsconfig.json');
  if (fs.existsSync(tsconfigPath)) {
    checks.passed.push('✅ TypeScript configured');
  } else {
    checks.failed.push('❌ tsconfig.json missing');
  }
}

// Run all checks
console.log('\n📋 Running checks...\n');

checkEnvFile();
checkPrismaClient();
checkDatabaseSchema();
checkKeyFiles();
checkDependencies();
checkMigrations();
checkTypeScript();

// Display results
console.log('\n' + '='.repeat(50));
console.log('\n✅ PASSED CHECKS:\n');
checks.passed.forEach(check => console.log(check));

if (checks.warnings.length > 0) {
  console.log('\n⚠️  WARNINGS:\n');
  checks.warnings.forEach(warning => console.log(warning));
}

if (checks.failed.length > 0) {
  console.log('\n❌ FAILED CHECKS:\n');
  checks.failed.forEach(fail => console.log(fail));
  console.log('\n' + '='.repeat(50));
  console.log('\n⚠️  Some checks failed. Please fix the issues above.\n');
  process.exit(1);
} else {
  console.log('\n' + '='.repeat(50));
  console.log('\n🎉 All checks passed! Your LocalGrid setup is ready!\n');
  console.log('Next steps:');
  console.log('  1. Start development server: npm run dev');
  console.log('  2. Visit: http://localhost:3000');
  console.log('  3. Test signup with both roles (Provider & Creator)');
  console.log('  4. Read SETUP_FIXES.md for detailed documentation\n');
}
