import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
    userId: {
        type: String, // String for now as we have a static user
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please provide team name'],
        trim: true,
        minlength: [4, 'Team name must be more than 3 characters long']
    },
    logo: {
        type: String, // Base64 or URL
        required: [true, 'Please provide organization logo']
    },
    primaryColor: {
        type: String,
        default: '#0a47c2'
    },
    disciplines: [{
        type: String
    }],
    facilities: [{
        name: String,
        discipline: String
    }],
    onboardingStep: {
        type: Number,
        default: 1
    }
}, { timestamps: true });

export default mongoose.model('Team', teamSchema);
