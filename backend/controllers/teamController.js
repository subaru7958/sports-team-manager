import Team from '../models/Team.js';
import catchAsync from '../utils/catchAsync.js';
import ErrorHandler from '../utils/ErrorHandler.js';

export const saveTeamIdentity = catchAsync(async (req, res, next) => {
    const { name, logo, primaryColor } = req.body;
    // user email is attached via isAuthenticated middleware
    const userId = req.user.email;

    let team = await Team.findOne({ userId });

    if (team) {
        team.name = name;
        team.logo = logo;
        team.primaryColor = primaryColor;
        team.onboardingStep = 2;
        await team.save();
    } else {
        team = await Team.create({
            userId,
            name,
            logo,
            primaryColor,
            onboardingStep: 2
        });
    }

    res.status(200).json({
        success: true,
        message: 'Team identity saved successfully',
        team
    });
});

export const saveDisciplines = catchAsync(async (req, res, next) => {
    const { disciplines, facilityCounts } = req.body;
    const userId = req.user.email;

    let team = await Team.findOne({ userId });

    if (!team) {
        return next(new ErrorHandler('Team not found', 404));
    }

    const getFieldLabel = (sport) => {
        if (sport === "Tennis") return "Court";
        if (sport === "Swimming") return "Pool";
        if (sport === "Basketball" || sport === "Handball" || sport === "Volleyball") return "Court";
        return "Field";
    };

    const initialFacilities = [];
    disciplines.forEach(sport => {
        const count = facilityCounts[sport] || 1;
        const label = getFieldLabel(sport);
        for (let i = 1; i <= count; i++) {
            initialFacilities.push({
                name: `Main ${label} ${count > 1 ? i : ''}`.trim(),
                discipline: sport.toLowerCase()
            });
        }
    });

    team.disciplines = disciplines;
    team.facilities = initialFacilities;
    team.onboardingStep = 3;
    await team.save();

    res.status(200).json({
        success: true,
        message: 'Disciplines and initial facilities saved successfully',
        team
    });
});

export const saveFacilities = catchAsync(async (req, res, next) => {
    const { facilities } = req.body;
    const userId = req.user.email;

    let team = await Team.findOne({ userId });

    if (!team) {
        return next(new ErrorHandler('Team not found', 404));
    }

    team.facilities = facilities;
    team.onboardingStep = 4;
    await team.save();

    res.status(200).json({
        success: true,
        message: 'Facilities configured successfully',
        team
    });
});

export const getTeam = catchAsync(async (req, res, next) => {
    const userId = req.user.email;
    const team = await Team.findOne({ userId });

    res.status(200).json({
        success: true,
        team
    });
});

export const updateTeam = catchAsync(async (req, res, next) => {
    const userId = req.user.email;
    const { name, logo, primaryColor, disciplines, facilities } = req.body;

    let team = await Team.findOne({ userId });

    if (!team) {
        return next(new ErrorHandler('Team not found', 404));
    }

    // Update only provided fields
    if (name) team.name = name;
    if (logo) team.logo = logo;
    if (primaryColor) team.primaryColor = primaryColor;
    if (disciplines) team.disciplines = disciplines;
    if (facilities) team.facilities = facilities;

    await team.save();

    res.status(200).json({
        success: true,
        message: 'Team updated successfully',
        team
    });
});
