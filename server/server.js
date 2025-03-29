     const express = require('express');
     const request = require('request');
     const app = express();

     const PORT = 3000; // You can change this to any port you prefer

     app.use(express.json());

     app.post('/api/OCRDocument/GetOCRChangesData', (req, res) => {
         const options = {
             url: 'https://api.boga.co.id/api/OCRDocument/GetOCRChangesData',
             method: 'POST',
             headers: {
                 'Content-Type': 'application/json',
                 'Authorization': 'Basic Qm9nYTpNYWp1QmVyc2FtYUJvZ2E='
             },
             body: JSON.stringify(req.body)
         };

         request(options, (error, response, body) => {
             if (error) {
                 return res.status(500).send(error);
             }
             res.status(response.statusCode).send(body);
         });
     });

     app.listen(PORT, () => {
         console.log(`Proxy server is running on http://localhost:${PORT}`);
     });
