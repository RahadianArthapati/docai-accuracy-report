const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Serve static files from the current directory
app.use(express.static(__dirname));

// Proxy endpoint
app.post('/api/proxy', async (req, res) => {
  try {
    const response = await axios.post(
      'https://api.boga.co.id/api/OCRDocument/GetOCRChangesData',
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic Qm9nYTpNYWp1QmVyc2FtYUJvZ2E='
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: error.message,
      details: error.response?.data
    });
  }
});

// Serve index.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
}); 