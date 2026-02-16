import mongoose from 'mongoose';

const seasonSchema = new mongoose.Schema({
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    discipline: {
        type: String,
        required: [true, 'Please provide the discipline for this season'],
        lowercase: true
    },
    description: {
        type: String,
        trim: true
    },
    name: {
        type: String,
        required: [true, 'Please provide a name for the season (e.g. Winter 2026)'],
        trim: true
    },
    startDate: {
        type: Date,
        required: [true, 'Please provide a start date']
    },
    endDate: {
        type: Date,
        required: [true, 'Please provide an end date']
    },
    status: {
        type: String,
        enum: ['active', 'archived', 'upcoming'],
        default: 'upcoming'
    }
}, { timestamps: true });

export default mongoose.model('Season', seasonSchema);
