const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Razorpay MERN Project...\n');

// Check if .env file exists
if (!fs.existsSync('.env')) {
  console.log('📝 Creating .env file...');
  fs.copyFileSync('env.example', '.env');
  console.log('✅ .env file created. Please update it with your Razorpay API keys.\n');
} else {
  console.log('✅ .env file already exists.\n');
}

// Install backend dependencies
console.log('📦 Installing backend dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Backend dependencies installed.\n');
} catch (error) {
  console.log('❌ Failed to install backend dependencies.');
  process.exit(1);
}

// Install frontend dependencies
console.log('📦 Installing frontend dependencies...');
try {
  execSync('cd client && npm install', { stdio: 'inherit' });
  console.log('✅ Frontend dependencies installed.\n');
} catch (error) {
  console.log('❌ Failed to install frontend dependencies.');
  process.exit(1);
}

console.log('🎉 Setup completed successfully!\n');
console.log('📋 Next steps:');
console.log('1. Update your .env file with Razorpay API keys');
console.log('2. Ensure MongoDB is running');
console.log('3. Start the backend: npm run dev');
console.log('4. Start the frontend: npm run client');
console.log('\n🌐 Your app will be available at:');
console.log('   Frontend: http://localhost:3000');
console.log('   Backend: http://localhost:5000');
