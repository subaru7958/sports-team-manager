import Season from '../models/Season.js';
import Team from '../models/Team.js';
import catchAsync from '../utils/catchAsync.js';
import ErrorHandler from '../utils/ErrorHandler.js';

// Create New Season
export const createSeason = catchAsync(async (req, res, next) => {
    const userId = req.user.email;
    const team = await Team.findOne({ userId: { $regex: new RegExp(`^${userId}$`, 'i') } });

    if (!team) {
        console.log(`[DEBUG] Team not found for email: "${userId}" (length: ${userId.length})`);
        const allTeams = await Team.find({});
        console.log(`[DEBUG] Total teams in DB: ${allTeams.length}`);
        if (allTeams.length > 0) {
            console.log(`[DEBUG] Sample team userId in DB: "${allTeams[0].userId}"`);
        }
        return next(new ErrorHandler('Team not found. Please ensure your organization setup is complete.', 404));
    }

    const { name, discipline, startDate, endDate, description } = req.body;
    console.log("Backend: Received season creation request:", { name, discipline, startDate, endDate, description });

    const season = await Season.create({
        teamId: team._id,
        name,
        discipline,
        startDate,
        endDate,
        description
    });

    res.status(201).json({
        success: true,
        message: 'Season created successfully',
        season
    });
});

// Get All Seasons for a Team
export const getMySeasons = catchAsync(async (req, res, next) => {
    const userId = req.user.email;
    const team = await Team.findOne({ userId: { $regex: new RegExp(`^${userId}$`, 'i') } });

    if (!team) {
        console.log(`[DEBUG] getMySeasons: Team not found for email: "${userId}"`);
        return next(new ErrorHandler('Team not found', 404));
    }

    const seasons = await Season.find({ teamId: team._id });

    res.status(200).json({
        success: true,
        seasons
    });
});

// Delete Season
export const deleteSeason = catchAsync(async (req, res, next) => {
    const season = await Season.findById(req.params.id);

    if (!season) {
        return next(new ErrorHandler('Season not found', 404));
    }

    await season.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Season deleted successfully'
    });
});
