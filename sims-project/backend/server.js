const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const studentRoutes = require('./routes/students');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Routes
app.use('/api/students', studentRoutes);

// Serve frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'SIMS Server is running',
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`🎓 SIMS Server running on http://localhost:${PORT}`);
    console.log(`📚 Frontend available at http://localhost:${PORT}`);
    console.log(`🔍 API Health check: http://localhost:${PORT}/api/health`);
});