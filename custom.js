const express = require('express');
const { deleteUser } = require('./firebaseAdmin');
const cors = require('cors'); // Use CORS for cross-origin requests if needed

const app = express();

// Middleware
app.use(express.json());
app.use(cors()); // Adjust CORS settings as needed

// API to delete a user
app.post('/deleteUser', async (req, res) => {
    const { uid } = req.body;

    if (!uid) {
        return res.status(400).send({ error: "UID is required" });
    }

    try {
        await deleteUser(uid);
        res.status(200).send({ message: `User with UID: ${uid} deleted successfully` });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
