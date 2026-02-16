import mongoose from 'mongoose';

const coachSchema = new mongoose.Schema({
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    fullName: {
        type: String,
        required: [true, 'Please provide coach name'],
        trim: true
    },
    phone: {
        type: String
    },
    specialty: {
        type: String, // e.g. Technical, Fitness, Goalkeeper
        required: true
    },
    discipline: {
        type: String,
        required: true,
        lowercase: true
    },
    category: {
        type: String, // e.g. academy, senior, youth
        default: 'senior'
    },
    image: {
        type: String // base64
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, { timestamps: true });

export default mongoose.model('Coach', coachSchema);
