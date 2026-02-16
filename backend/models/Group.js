import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
    seasonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Season',
        required: true,
        index: true // Index for efficient season-based lookups
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true,
        index: true // Index for efficient team-based lookups
    },
    name: {
        type: String,
        required: [true, 'Please provide a name for the group'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Please provide a category for the group']
    },
    discipline: {
        type: String,
        required: true,
        lowercase: true
    },
    coaches: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coach'
    }],
    players: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    }]
}, { timestamps: true });

// Compound index for unique group names within a season
// Prevents duplicate groups like "Elite Squad" in the same season
groupSchema.index({ seasonId: 1, name: 1 }, { unique: true });

export default mongoose.model('Group', groupSchema);
