import Group from '../models/Group.js';
import Team from '../models/Team.js';
import catchAsync from '../utils/catchAsync.js';
import ErrorHandler from '../utils/ErrorHandler.js';

export const createGroup = catchAsync(async (req, res, next) => {
    const userId = req.user.email;
    const team = await Team.findOne({ userId: { $regex: new RegExp(`^${userId}$`, 'i') } });

    if (!team) {
        return next(new ErrorHandler('Team not found', 404));
    }

    const { seasonId, name, category, discipline, coaches, players } = req.body;

    const newGroup = await Group.create({
        seasonId,
        teamId: team._id,
        name,
        category,
        discipline,
        coaches,
        players: players || []
    });

    // Populate coaches and players before sending response
    const populatedGroup = await Group.findById(newGroup._id)
        .populate('coaches', 'fullName image specialty discipline')
        .populate('players', 'fullName image category dateOfBirth discipline');

    res.status(201).json({
        success: true,
        group: populatedGroup
    });
});

export const getSeasonGroups = catchAsync(async (req, res, next) => {
    const userId = req.user.email;
    const team = await Team.findOne({ userId: { $regex: new RegExp(`^${userId}$`, 'i') } });

    if (!team) {
        return next(new ErrorHandler('Team not found', 404));
    }

    const { seasonId } = req.params;

    const groups = await Group.find({ seasonId, teamId: team._id })
        .populate('coaches', 'fullName image specialty discipline')
        .populate('players', 'fullName image category dateOfBirth discipline')
        .lean(); // Convert Mongoose documents to plain JS objects for better performance

    res.status(200).json({
        success: true,
        groups
    });
});

export const updateGroup = catchAsync(async (req, res, next) => {
    const userId = req.user.email;
    const team = await Team.findOne({ userId: { $regex: new RegExp(`^${userId}$`, 'i') } });

    if (!team) {
        return next(new ErrorHandler('Team not found', 404));
    }

    const { groupId } = req.params;

    const updatedGroup = await Group.findByIdAndUpdate(groupId, req.body, {
        new: true,
        runValidators: true
    })
        .populate('coaches', 'fullName image specialty discipline')
        .populate('players', 'fullName image category dateOfBirth discipline');

    if (!updatedGroup) {
        return next(new ErrorHandler('Group not found', 404));
    }

    res.status(200).json({
        success: true,
        group: updatedGroup
    });
});

export const deleteGroup = catchAsync(async (req, res, next) => {
    const userId = req.user.email;
    const team = await Team.findOne({ userId: { $regex: new RegExp(`^${userId}$`, 'i') } });

    if (!team) {
        return next(new ErrorHandler('Team not found', 404));
    }

    const { groupId } = req.params;

    const deletedGroup = await Group.findOneAndDelete({ _id: groupId, teamId: team._id });

    if (!deletedGroup) {
        return next(new ErrorHandler('Group not found', 404));
    }

    res.status(200).json({
        success: true,
        message: 'Group deleted successfully'
    });
});
