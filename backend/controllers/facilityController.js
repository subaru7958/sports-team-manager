import Team from '../models/Team.js';
import ErrorHandler from '../utils/ErrorHandler.js';
import catchAsync from '../utils/catchAsync.js';

export const getFacilities = catchAsync(async (req, res, next) => {
    const userId = req.user.email;
    const team = await Team.findOne({ userId: { $regex: new RegExp(`^${userId}$`, 'i') } });

    if (!team) {
        return next(new ErrorHandler('Team not found', 404));
    }

    const { discipline } = req.query;
    let facilities = [];

    if (team.facilities && team.facilities.length > 0) {
        // If discipline specific
        if (discipline) {
            const disciplineKey = discipline.trim().toLowerCase();
            facilities = team.facilities.filter(f => f.discipline && f.discipline.trim().toLowerCase() === disciplineKey);
        } else {
            // Return all facilities if no discipline filtered (though usually frontend filters)
            facilities = team.facilities;
        }
    }

    res.status(200).json({
        success: true,
        facilities
    });
});

export const createFacility = catchAsync(async (req, res, next) => {
    const userId = req.user.email;
    const team = await Team.findOne({ userId: { $regex: new RegExp(`^${userId}$`, 'i') } });

    if (!team) {
        return next(new ErrorHandler('Team not found', 404));
    }

    const name = String(req.body?.name || '').trim();
    const discipline = String(req.body?.discipline || '').trim().toLowerCase();

    if (!name) {
        return next(new ErrorHandler('Facility name is required', 400));
    }

    if (!discipline) {
        return next(new ErrorHandler('Discipline is required', 400));
    }

    const nameKey = name.toLowerCase();
    const exists = (team.facilities || []).some(f =>
        String(f?.discipline || '').trim().toLowerCase() === discipline &&
        String(f?.name || '').trim().toLowerCase() === nameKey
    );

    if (exists) {
        return next(new ErrorHandler('Facility already exists for this discipline', 400));
    }

    team.facilities = team.facilities || [];
    team.facilities.push({ name, discipline });
    await team.save();

    res.status(201).json({
        success: true,
        facility: team.facilities[team.facilities.length - 1],
        facilities: team.facilities
    });
});
