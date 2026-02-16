import Player from '../models/Player.js';
import Team from '../models/Team.js';
import catchAsync from '../utils/catchAsync.js';
import ErrorHandler from '../utils/ErrorHandler.js';

// Add New Player
export const addPlayer = catchAsync(async (req, res, next) => {
    const userId = req.user.email;
    const team = await Team.findOne({ userId: { $regex: new RegExp(`^${userId}$`, 'i') } });

    if (!team) {
        return next(new ErrorHandler('Team not found', 404));
    }

    const { fullName, dateOfBirth, phone, weight, height, category, discipline, image } = req.body;

    console.log('--- PLAYER CREATION REQUEST ---');
    console.log('Payload:', { ...req.body, image: image ? 'base64_data' : 'none' });
    console.log('User Email:', userId);

    const player = await Player.create({
        teamId: team._id,
        fullName,
        dateOfBirth,
        phone,
        weight,
        height,
        category,
        discipline,
        image
    });

    console.log('SUCCESS: Player created with ID:', player._id);
    console.log('-------------------------------');

    res.status(201).json({
        success: true,
        message: 'Player registered successfully',
        player
    });
});

// Get My Players
export const getMyPlayers = catchAsync(async (req, res, next) => {
    const userId = req.user.email;
    const team = await Team.findOne({ userId: { $regex: new RegExp(`^${userId}$`, 'i') } });

    if (!team) {
        return next(new ErrorHandler('Team not found', 404));
    }

    const players = await Player.find({ teamId: team._id });

    res.status(200).json({
        success: true,
        count: players.length,
        players
    });
});

// Update Player
export const updatePlayer = catchAsync(async (req, res, next) => {
    let player = await Player.findById(req.params.id);

    if (!player) {
        return next(new ErrorHandler('Player not found', 404));
    }

    // Verify ownership
    const userId = req.user.email;
    const team = await Team.findOne({ userId: { $regex: new RegExp(`^${userId}$`, 'i') } });
    if (!team || player.teamId.toString() !== team._id.toString()) {
        return next(new ErrorHandler('Unauthorized Access', 401));
    }

    player = await Player.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true,
        message: 'Player updated successfully',
        player
    });
});

// Delete Player
export const deletePlayer = catchAsync(async (req, res, next) => {
    const player = await Player.findById(req.params.id);

    if (!player) {
        return next(new ErrorHandler('Player not found', 404));
    }

    // Verify ownership
    const userId = req.user.email;
    const team = await Team.findOne({ userId: { $regex: new RegExp(`^${userId}$`, 'i') } });
    if (!team || player.teamId.toString() !== team._id.toString()) {
        return next(new ErrorHandler('Unauthorized Access', 401));
    }

    await player.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Player deleted successfully'
    });
});
