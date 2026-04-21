require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Handle uncaught exceptions to prevent silent crashes
process.on('uncaughtException', (err) => {
  console.error('🔥 UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message, err.stack);
});

process.on('unhandledRejection', (err) => {
  console.error('🔥 UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message, err.stack);
});

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/test', require('./routes/test.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/tournaments', require('./routes/tournament.routes'));
app.use('/api/matches', require('./routes/match.routes'));
app.use('/api/live', require('./routes/live.routes'));
app.use('/api/chat', require('./routes/chat.routes'));
app.use('/api/teams', require('./routes/team.routes'));
app.use('/api/team-battle', require('./routes/team-battle.routes'));
app.use('/api/leaderboard', require('./routes/leaderboard.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Request Error:', err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

const PORT = process.env.PORT || 5000;

// Start Server
const server = app.listen(PORT, () => {
  console.log(`
  --------------------------------------------------
  🚀 ATLANTIC ESPORT Backend running on port ${PORT}
  🌍 Environment: ${process.env.NODE_ENV || 'development'}
  --------------------------------------------------
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated.');
  });
});
