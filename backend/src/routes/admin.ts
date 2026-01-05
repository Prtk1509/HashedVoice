import express from "express";
import Voter from "../models/Voter";

const router = express.Router();

// POST /api/admin/revoke

router.post("/revoke", async (req, res) => {
    const {admission} = req.body;

    if(!admission) {
        return res.status(400).json({message: "Admission number required"});
    }

    try {
        const result = await Voter.updateMany(
            { admission },
            { $set: { revoked: true } }
        );

        res.json({
            message: "Voting rights revoked",
            affected: result.modifiedCount
        });
    } catch(err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;