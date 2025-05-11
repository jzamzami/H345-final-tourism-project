import axios from "axios";
import express from "express";
import { _SQLiteTaskModel } from "model.js";

const userData = [];
const router = express.Router();

router.use(express.json());

const db = new _SQLiteTaskModel();
db.init();

const app = express();
const PORT = 3000;

app.use(express.static("frontend"));
app.use(express.json());

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.post("/users", async (req, res) => {
    const { userId, userAge, userBudget, travelDuration, currentView, travelHistory, locationsOfInterest, userPriorities } = req.body;
    try {
        let user = await User.findByPk(userId);
        if (!user) {
            user = await User.create({
                userID: userId,
                userAge,
                userBudget,
                travelDuration,
                currentView,
                travelHistory,
                locationsOfInterest,
                userPriorities
            });
        }
        res.json(user);
    } catch (err) {
        console.error("Error in POST /users:", err);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});

app.post("/insert_embeddings", async (req, res) => {
    try {
        const response = await axios.post('http://127.0.0.1:5000/insert_embeddings', {
            csv_path: req.body.csv_path
        });
        res.json(response.data);
    } catch (error) {
        console.error("Error calling Python API:", error);
        res.status(500).json({ message: "Error calling Python API", error: error.message });
    }
});

app.post("/find_similar", async (req, res) => {
    try {
        const response = await axios.post('http://127.0.0.1:5000/find_similar', {
            query: req.body.query
        });
        res.json(response.data);
    } catch (error) {
        console.error("Error calling Python API:", error);
        res.status(500).json({ message: "Error calling Python API", error: error.message });
    }
});
