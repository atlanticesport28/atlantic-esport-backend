const express = require('express');
const cors = require('cors');
require('dotenv').config();

const supabase = require('./config/supabase');

const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const matchRoutes = require('./modules/matches/match.routes');
const leaderboardRoutes = require('./modules/leaderboard/leaderboard.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

app.get('/', (req, res) => {
  res.send('ATLANTIC ESPORT API RUNNING 🚀');
});

module.exports = app;
