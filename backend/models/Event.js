import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true,
        index: true
    },
    seasonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Season',
        required: true,
        index: true
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true,
        index: true
    },
    facilityId: {
        type: mongoose.Schema.Types.ObjectId,
        // ref: 'Facility', // Removed as per instructions
        required: true,
        index: true
    },
    title: {
        type: String,
        required: [true, 'Please provide an event title'],
        trim: true
    },
    startTime: {
        type: Date,
        required: true,
        index: true
    },
    endTime: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        enum: ['regular', 'weekly'],
        default: 'regular'
    },
    seriesId: {
        // Used to link recurring events together
        type: String,
        index: true,
        default: null
    },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled', 'delayed'],
        default: 'scheduled'
    }
}, { timestamps: true });

// Ensure end time is after start time
// Mongoose 9.x doesn't use next() in middleware
eventSchema.pre('validate', function () {
    if (this.startTime >= this.endTime) {
        this.invalidate('endTime', 'End time must be after start time');
    }
});

// Compound index for efficient calendar queries
eventSchema.index({ facilityId: 1, startTime: 1, endTime: 1 });
eventSchema.index({ seasonId: 1, startTime: 1 });

export default mongoose.model('Event', eventSchema);
