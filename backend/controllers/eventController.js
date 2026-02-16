import Event from '../models/Event.js';
import Season from '../models/Season.js';
import Team from '../models/Team.js';
import ErrorHandler from '../utils/ErrorHandler.js';
import catchAsync from '../utils/catchAsync.js';
import { addWeeks, isAfter } from 'date-fns';
import crypto from 'crypto';
import mongoose from 'mongoose';

export const getEvents = catchAsync(async (req, res, next) => {
    const userId = req.user.email;
    const team = await Team.findOne({ userId });

    if (!team) {
        return next(new ErrorHandler('Team not found', 404));
    }

    const { seasonId } = req.params;
    const { start, end } = req.query;

    const query = { teamId: team._id, seasonId };
    if (start && end) {
        query.startTime = {
            $gte: new Date(start),
            $lte: new Date(end)
        };
    }

    const events = await Event.find(query)
        .populate({
            path: 'groupId',
            select: 'name category coaches',
            populate: {
                path: 'coaches',
                select: 'fullName specialty'
            }
        })
        .populate('facilityId', 'name type')
        .sort('startTime');

    res.status(200).json({
        success: true,
        count: events.length,
        events
    });
});

export const createEvent = catchAsync(async (req, res, next) => {
    const userId = req.user.email;
    const team = await Team.findOne({ userId });

    if (!team) {
        return next(new ErrorHandler('Team not found', 404));
    }

    const title = String(req.body?.title || '').trim();
    const groupId = req.body?.groupId;
    const facilityId = req.body?.facilityId;
    const startTime = req.body?.startTime;
    const endTime = req.body?.endTime;
    const type = req.body?.type || 'regular';
    const seasonId = req.body?.seasonId;

    console.log('[DEBUG] All input fields:', { title, groupId, facilityId, startTime, endTime, type, seasonId });

    if (!title) return next(new ErrorHandler('Event title is required', 400));
    if (!groupId) return next(new ErrorHandler('Group is required', 400));
    if (!facilityId) return next(new ErrorHandler('Facility is required', 400));
    if (!seasonId) return next(new ErrorHandler('Season is required', 400));

    if (!mongoose.Types.ObjectId.isValid(groupId)) return next(new ErrorHandler('Invalid groupId', 400));
    if (!mongoose.Types.ObjectId.isValid(facilityId)) return next(new ErrorHandler('Invalid facilityId', 400));
    if (!mongoose.Types.ObjectId.isValid(seasonId)) return next(new ErrorHandler('Invalid seasonId', 400));

    const season = await Season.findById(seasonId);
    if (!season) {
        return next(new ErrorHandler('Season not found', 404));
    }

    const eventsToCreate = [];
    // Generate UUID for series if weekly
    const seriesId = type === 'weekly' ? crypto.randomUUID() : null;

    let currentStart = new Date(startTime);
    let currentEnd = new Date(endTime);

    if (Number.isNaN(currentStart.getTime())) return next(new ErrorHandler('Invalid startTime', 400));
    if (Number.isNaN(currentEnd.getTime())) return next(new ErrorHandler('Invalid endTime', 400));
    if (currentStart >= currentEnd) return next(new ErrorHandler('End time must be after start time', 400));

    const seasonEnd = new Date(season.endDate);
    // Add end of day buffer to season end to be inclusive
    seasonEnd.setHours(23, 59, 59, 999);

    // Create the initial event
    eventsToCreate.push({
        title,
        groupId,
        facilityId,
        seasonId,
        teamId: team._id,
        startTime: currentStart,
        endTime: currentEnd,
        type,
        seriesId
    });

    // If weekly, generate recurrences
    if (type === 'weekly') {
        while (true) {
            const nextStart = addWeeks(currentStart, 1);
            const nextEnd = addWeeks(currentEnd, 1);

            if (isAfter(nextStart, seasonEnd)) break;

            eventsToCreate.push({
                title,
                groupId,
                facilityId,
                seasonId,
                teamId: team._id,
                startTime: nextStart,
                endTime: nextEnd,
                type,
                seriesId
            });

            currentStart = nextStart;
            currentEnd = nextEnd;
        }
    }

    console.log('[DEBUG] About to insert', eventsToCreate.length, 'events');
    
    let createdEvents;
    try {
        createdEvents = await Event.insertMany(eventsToCreate);
    } catch (insertErr) {
        console.error('[DEBUG] Insert error:', insertErr);
        return res.status(400).json({
            success: false,
            message: 'Failed to insert event: ' + insertErr.message
        });
    }

    res.status(201).json({
        success: true,
        events: createdEvents,
        message: type === 'weekly'
            ? `Created ${createdEvents.length} weekly sessions`
            : 'Event created successfully'
    });
});

export const updateEvent = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { startTime, endTime, facilityId, title, status } = req.body;

    const updateData = {};
    if (startTime) updateData.startTime = startTime;
    if (endTime) updateData.endTime = endTime;
    if (facilityId) updateData.facilityId = facilityId;
    if (title) updateData.title = title;
    if (status) updateData.status = status;

    // Simple update logic for single instance editing (delaying, moving)
    const event = await Event.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!event) {
        return next(new ErrorHandler('Event not found', 404));
    }

    res.status(200).json({
        success: true,
        event
    });
});

export const deleteEvent = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { deleteSeries } = req.query; // Query param to delete entire series

    const event = await Event.findById(id);
    if (!event) {
        return next(new ErrorHandler('Event not found', 404));
    }

    if (deleteSeries === 'true' && event.seriesId) {
        // Delete all events with same seriesId
        await Event.deleteMany({ seriesId: event.seriesId });
    } else {
        // Delete single instance
        await event.deleteOne();
    }

    res.status(200).json({
        success: true,
        message: 'Event(s) deleted successfully'
    });
});
