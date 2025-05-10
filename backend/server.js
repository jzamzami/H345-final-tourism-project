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
})

app.post("/users", async (req, res) => {
    const {userId, userAge, userBudget, travelDuration, currentView, travelHistory, locationsOfInterest, userPriorities} = req.body;
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

    app.put("/users/:id", async (req, res) => {
            const userId = req.params.id;
            const updates = req.body;
            try {
            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            Object.assign(user, updates);
            await user.save();
            res.json({ status: "ok", updated: updates, user });
            } catch (err) {
            console.error("Error in PUT /users/:id:", err);
            res.status(500).json({ status: "error", message: "Internal server error" });
            }
        });

        app.delete("/users/:id", async (req, res) => {
                const userId = req.params.id;
                try {
                const user = await User.findByPk(userId);
                if (!user) {
                    return res.status(404).json({ message: "User not found" });
                }
                await user.destroy();
                res.json({ status: "ok", message: `User ${userId} data deleted.` });
                } catch (err) {
                console.error("Error in DELETE /users/:id:", err);
                res.status(500).json({ status: "error", message: "Internal server error" });
                }
            });