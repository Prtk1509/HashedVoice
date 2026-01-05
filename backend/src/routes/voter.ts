import express from "express";
import Voter from "../models/Voter";

const router = express.Router();

// POST /api/voters/register
router.post("/register", async (req,res) => {
    const { wallet, name, admission } = req.body;

    if(!wallet || !name || !admission) {
        return res.status(400).json({message: "Missing Fields"});
    }

    try {
        const existing = await Voter.findOne({wallet: wallet.toLowerCase()});
        if(existing) {
            return res.status(409).json({message: "Already registered"});
        }

        const voter = await Voter.create({
            wallet,
            name,
            admission
        });

        res.status(201).json(voter);
    } catch(err) {
        console.error(err);
        res.status(500).json({message: "Server Error"});
    }
});

// GET /api/voters/:wallet

router.get("/:wallet", async (req,res) => {
    const { wallet } = req.params;

    try{
        const voter = await Voter.findOne({
            wallet: wallet.toLowerCase()
        });

        if(!voter) {
            return res.status(404).json({ registered: false });
        }

        res.json({
            registered: true,
            wallet: voter.wallet,
            name: voter.name,
            admission: voter.admission,
            revoked: voter.revoked
        });
    } catch(err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;