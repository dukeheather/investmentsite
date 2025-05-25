const express = require('express');
const app = express();
const authRoutes = require('./routes/auth');
const teamsRoutes = require('./routes/teams');

// ... existing code ...

app.use('/api/auth', authRoutes);
app.use('/api/teams', teamsRoutes);

// ... existing code ... 