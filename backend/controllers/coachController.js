import Coach from '../models/Coach.js';
import Team from '../models/Team.js';
import catchAsync from '../utils/catchAsync.js';
import ErrorHandler from '../utils/ErrorHandler.js';

// Add New Coach
export const addCoach = catchAsync(async (req, res, next) => {
    const userId = req.user.email;
    const team = await Team.findOne({ userId: { $regex: new RegExp(`^${userId}$`, 'i') } });

    if (!team) {
        return next(new ErrorHandler('Team not found', 404));
    }

    const { fullName, phone, specialty, discipline, image } = req.body;

    const coach = await Coach.create({
        teamId: team._id,
        fullName,
        phone,
        specialty,
        discipline,
        image
    });

    res.status(201).json({
        success: true,
        message: 'Coach registered successfully',
        coach
    });
});

// Get My Coaches
export const getMyCoaches = catchAsync(async (req, res, next) => {
    const userId = req.user.email;
    const team = await Team.findOne({ userId: { $regex: new RegExp(`^${userId}$`, 'i') } });

    if (!team) {
        return next(new ErrorHandler('Team not found', 404));
    }

    const coaches = await Coach.find({ teamId: team._id });

    res.status(200).json({
        success: true,
        count: coaches.length,
        coaches
    });
});

// Update Coach
export const updateCoach = catchAsync(async (req, res, next) => {
    let coach = await Coach.findById(req.params.id);

    if (!coach) {
        return next(new ErrorHandler('Coach not found', 404));
    }

    // Verify ownership
    const userId = req.user.email;
    const team = await Team.findOne({ userId: { $regex: new RegExp(`^${userId}$`, 'i') } });
    if (!team || coach.teamId.toString() !== team._id.toString()) {
        return next(new ErrorHandler('Unauthorized Access', 401));
    }

    coach = await Coach.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        message: 'Coach updated successfully',
        coach
    });
});

// Delete Coach
export const deleteCoach = catchAsync(async (req, res, next) => {
    const coach = await Coach.findById(req.params.id);

    if (!coach) {
        return next(new ErrorHandler('Coach not found', 404));
    }

    // Verify ownership
    const userId = req.user.email;
    const team = await Team.findOne({ userId: { $regex: new RegExp(`^${userId}$`, 'i') } });
    if (!team || coach.teamId.toString() !== team._id.toString()) {
        return next(new ErrorHandler('Unauthorized Access', 401));
    }

    await coach.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Coach deleted successfully'
    });
});
