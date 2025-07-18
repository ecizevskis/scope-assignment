const express = require('express');
const cors = require('cors')
const fs = require('fs');
const app = express();
const PORT = 5000;


app.use(cors()); // Enable CORS for all requests

app.get('/api/users', (_, res) => {
    fs.readFile('./testDataServer/users.json', 'utf8', (err, jsonData) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read file. ' + err });
        }
        const data = JSON.parse(jsonData);
        res.json(data);
    });
});




app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
