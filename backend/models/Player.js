import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    fullName: {
        type: String,
        required: [true, 'Please provide player full name'],
        trim: true
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Please provide date of birth']
    },
    phone: {
        type: String,
        trim: true
    },
    weight: {
        type: Number, // in kg
    },
    height: {
        type: Number, // in cm
    },
    category: {
        type: String,
        required: [true, 'Please provide player category']
    },
    discipline: {
        type: String,
        required: [true, 'Please provide discipline'],
        lowercase: true
    },
    status: {
        type: String,
        enum: ['active', 'injured', 'inactive'],
        default: 'active'
    },
    image: {
        type: String // base64 string
    }
}, { timestamps: true });

export default mongoose.model('Player', playerSchema);
