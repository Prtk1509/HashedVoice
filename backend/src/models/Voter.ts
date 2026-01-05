import mongoose from "mongoose";

const VoterSchema = new mongoose.Schema(
    {
        wallet: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        name: {
            type: String,
            required: true
        },
        admission: {
            type: String,
            required: true
        },
        revoked: {
            type: Boolean,
            default: false
        }
    },
    {timestamps: true}
);

export default mongoose.model("Voter",VoterSchema);