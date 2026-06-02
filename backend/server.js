import app from './app.js';

const PORT = process.env.PORT || 5000;

console.log('📋 Starting server initialization...');
console.log('📋 PORT:', PORT);
console.log('📋 NODE_ENV:', process.env.NODE_ENV);

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('📋 Server successfully bound to port');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    console.log('💡 Try one of these solutions:');
    console.log(`   1. Kill the process: lsof -ti:${PORT} | xargs kill -9`);
    console.log(`   2. Use a different port: PORT=5001 npm run dev`);
    console.log(`   3. Wait a few seconds and restart the server`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', err);
  }
});

server.on('connection', (conn) => {
  console.log('📋 New connection established');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

console.log('📋 Server initialization complete');
