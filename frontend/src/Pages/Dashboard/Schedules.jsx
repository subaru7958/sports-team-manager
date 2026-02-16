import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSeason } from '../../context/SeasonContext';
import { useGroupResources } from '../../hooks/useGroupResources';
import api from '../../api/api';
import CreateEventModal from '../../components/CreateEventModal';
import { format, addDays, subDays, isSameDay, parseISO, startOfDay, differenceInMinutes, set } from 'date-fns';

const Schedule = () => {
    const { team } = useAuth();
    const { selectedSeason } = useSeason();
    const primaryColor = team?.primaryColor || "#0df2f2";

    const isReadOnly = selectedSeason?.status === 'archived';

    // Group Resources (Groups)
    const { availableCoaches: groups, loading: groupsLoading } = useGroupResources(selectedSeason);
    // Wait, useGroupResources returns coaches/players. I need GROUPS. 
    // I need to fetch groups separately.

    const [seasonGroups, setSeasonGroups] = useState([]);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewType, setViewType] = useState('Day'); // Day, Week, Month
    const [events, setEvents] = useState([]);
    const [facilities, setFacilities] = useState([]);
    const [visibleFacilityIds, setVisibleFacilityIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [isDelayModalOpen, setDelayModalOpen] = useState(false);
    const [delayEvent, setDelayEvent] = useState(null);
    const [delayData, setDelayData] = useState({ date: '', startTime: '08:00', endTime: '09:30' });

    // Fetch Groups and Facilities
    useEffect(() => {
        if (selectedSeason) {
            fetchInitialData();
        }
    }, [selectedSeason]);

    // Fetch Events when Date or Season Changes
    useEffect(() => {
        if (selectedSeason) {
            fetchEvents();
        }
    }, [selectedSeason, currentDate, viewType]); // Optimized to fetch ranged events

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [facilitiesRes, groupsRes] = await Promise.all([
                api.get(`/facilities?discipline=${selectedSeason.discipline}`),
                api.get(`/groups/season/${selectedSeason._id}`)
            ]);

            if (facilitiesRes.data.success) {
                setFacilities(facilitiesRes.data.facilities);
                // Default all visible
                setVisibleFacilityIds(new Set(facilitiesRes.data.facilities.map(f => f._id)));
            }

            if (groupsRes.data.success) {
                setSeasonGroups(groupsRes.data.groups);
            }

        } catch (err) {
            console.error("Failed to fetch schedule data", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchEvents = async () => {
        // Calculate range based on viewType
        let start = startOfDay(currentDate);
        let end = addDays(start, 1); // Default 1 day

        if (viewType === 'Week') end = addDays(start, 7);
        if (viewType === 'Month') end = addDays(start, 30); // Simplified

        try {
            const response = await api.get(`/events/season/${selectedSeason._id}?start=${start.toISOString()}&end=${end.toISOString()}`);
            if (response.data.success) {
                setEvents(response.data.events);
            }
        } catch (err) {
            console.error("Failed to fetch events", err);
        }
    };

    const handleSaveEvent = async (eventData) => {
        try {
            let response;
            if (editingEvent) {
                response = await api.put(`/events/${editingEvent._id}`, eventData);
            } else {
                response = await api.post('/events', eventData);
            }

            if (response.data.success) {
                fetchEvents(); // Refresh
                setEditingEvent(null); // Clear editing state
                // alert(response.data.message || 'Saved successfully'); // Optional feedback
            }
        } catch (err) {
            console.error('Failed to save event:', err);
            throw err; // Re-throw so modal can display the error
        }
    };

    const handleDeleteEvent = async (eventId, seriesId) => {
        if (!window.confirm("Delete this event?")) return;

        let url = `/events/${eventId}`;

        // If series, ask user
        if (seriesId) {
            const deleteSeries = window.confirm("This is a recurring event. Delete entire series?");
            if (deleteSeries) url += '?deleteSeries=true';
        }

        try {
            await api.delete(url);
            fetchEvents();
        } catch (err) {
            console.error(err);
            alert("Failed to delete event");
        }
    };

    const openDelayModal = (event) => {
        const eventDate = new Date(event.startTime);
        setDelayEvent(event);
        setDelayData({
            date: format(eventDate, 'yyyy-MM-dd'),
            startTime: format(eventDate, 'HH:mm'),
            endTime: format(new Date(event.endTime), 'HH:mm')
        });
        setDelayModalOpen(true);
    };

    const handleDelayEvent = async () => {
        if (!delayData.date || !delayData.startTime || !delayData.endTime) {
            alert('Please fill in all date and time fields');
            return;
        }

        const newStartTime = new Date(`${delayData.date}T${delayData.startTime}:00`);
        const newEndTime = new Date(`${delayData.date}T${delayData.endTime}:00`);

        if (newStartTime >= newEndTime) {
            alert('End time must be after start time');
            return;
        }

        try {
            await api.put(`/events/${delayEvent._id}`, {
                startTime: newStartTime,
                endTime: newEndTime,
                status: 'delayed'
            });
            setDelayModalOpen(false);
            fetchEvents();
        } catch (err) {
            console.error(err);
            alert('Failed to delay event');
        }
    };

    // Calendar Grid Calculations
    const startHour = 8;
    const endHour = 22;
    const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
    const pixelsPerHour = 100; // Taller slots as per HTML
    const pixelsPerMinute = pixelsPerHour / 60;

    const getEventStyle = (event) => {
        const start = parseISO(event.startTime);
        const end = parseISO(event.endTime);
        const dayStart = set(start, { hours: startHour, minutes: 0, seconds: 0 });

        const offsetMinutes = differenceInMinutes(start, dayStart);
        const durationMinutes = differenceInMinutes(end, start);

        return {
            top: `${Math.max(0, offsetMinutes * pixelsPerMinute)}px`,
            height: `${durationMinutes * pixelsPerMinute}px`,
            left: '4px',
            right: '4px'
        };
    };

    // Helper to get active facilities (selected or all if none selected)
    const getActiveFacilities = () => {
        if (visibleFacilityIds.size === 0) return facilities;
        return facilities.filter(f => visibleFacilityIds.has(f._id));
    };

    // Group events by facility
    const eventsByFacility = useMemo(() => {
        const map = {};
        const activeFacilities = getActiveFacilities();
        activeFacilities.forEach(f => map[f._id] = []);
        const now = new Date();
        events.forEach(event => {
            // Filter by current day for Day View
            if (isSameDay(parseISO(event.startTime), currentDate)) {
                const eventFacilityId = event.facilityId._id || event.facilityId;
                if (map[eventFacilityId]) {
                    // Auto-complete past events
                    const eventEndTime = new Date(event.endTime);
                    const displayEvent = { ...event };
                    if (eventEndTime < now && !event.status) {
                        displayEvent.status = 'completed';
                    }
                    map[eventFacilityId].push(displayEvent);
                }
            }
        });
        return map;
    }, [events, getActiveFacilities, currentDate]);

    if (!selectedSeason) return <div className="p-10 text-center">Select a season to view schedule</div>;

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-background-light font-display text-[#111818]">
            {/* Sidebar Filters */}
            <aside className="w-72 bg-white border-r border-[#f0f5f5] flex flex-col p-4 shrink-0 shadow-sm z-20">
                <div className="flex flex-col gap-6 h-full">
                    <div className="flex flex-col">
                        <h1 className="text-sm font-bold uppercase tracking-wider text-[#608a8a]">Active Filters</h1>
                        <p className="text-xs text-[#608a8a] mt-1">Refine your lane visibility</p>
                    </div>

                    <div className="flex flex-col gap-2 overflow-y-auto max-h-[50vh]">
                        {facilities.length > 0 ? facilities.map(facility => (
                            <div
                                key={facility._id}
                                onClick={() => {
                                    const newSet = new Set(visibleFacilityIds);
                                    if (newSet.has(facility._id)) newSet.delete(facility._id);
                                    else newSet.add(facility._id);
                                    setVisibleFacilityIds(newSet);
                                }}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${visibleFacilityIds.has(facility._id) ? 'bg-primary/10 text-black' : 'hover:bg-[#f0f5f5] text-slate-500'}`}
                            >
                                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: visibleFacilityIds.has(facility._id) ? "'FILL' 1" : "'FILL' 0" }}>location_on</span>
                                <p className={`text-sm ${visibleFacilityIds.has(facility._id) ? 'font-bold' : 'font-medium'}`}>{facility.name}</p>
                            </div>
                        )) : (
                            <p className="text-sm text-slate-400 italic">No facilities found for this discipline.</p>
                        )}

                    </div>

                    <div className="mt-4 border-t border-[#f0f5f5] pt-6">
                        <h1 className="text-sm font-bold uppercase tracking-wider text-[#608a8a] mb-4">Conflict Alerts</h1>
                        <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                            <div className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-red-500 text-lg">warning</span>
                                <div>
                                    <p className="text-xs font-bold text-red-600">System Alert</p>
                                    <p className="text-[10px] text-red-600/80">Conflicts are highlighted directly on the calendar grid.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Header Controls */}
                <div className="bg-white px-8 py-4 border-b border-[#f0f5f5] z-10 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[#608a8a] text-sm font-medium hover:text-primary">{selectedSeason.name}</span>
                        <span className="text-[#608a8a] text-sm font-medium">/</span>
                        <span className="text-[#111818] text-sm font-medium capitalize">{selectedSeason.discipline}</span>
                    </div>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                                <h1 className="text-3xl font-black leading-tight tracking-[-0.033em]">Field Lanes View</h1>
                                <p className="text-[#608a8a] text-sm font-normal">{format(currentDate, 'EEEE, MMM do, yyyy')}</p>
                            </div>
                            <div className="flex items-center gap-2 bg-[#f0f5f5] rounded-lg p-1 ml-4">
                                <button onClick={() => setCurrentDate(subDays(currentDate, 1))} className="p-1 hover:text-primary transition-colors rounded hover:bg-white"><span className="material-symbols-outlined">chevron_left</span></button>
                                <button onClick={() => setCurrentDate(new Date())} className="px-4 py-1.5 text-xs font-bold bg-white rounded-md shadow-sm hover:shadow">Today</button>
                                <button onClick={() => setCurrentDate(addDays(currentDate, 1))} className="p-1 hover:text-primary transition-colors rounded hover:bg-white"><span className="material-symbols-outlined">chevron_right</span></button>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 items-center justify-center rounded-lg bg-[#f0f5f5] p-1 min-w-[180px]">
                                {['Day', 'Week', 'Month'].map(type => (
                                    <label key={type} className={`flex cursor-pointer h-full grow items-center justify-center rounded-md px-4 text-xs font-bold transition-all ${viewType === type ? 'bg-white shadow-sm text-primary' : 'text-[#608a8a] hover:text-slate-600'}`}>
                                        <span className="truncate">{type}</span>
                                        <input
                                            type="radio"
                                            name="view-type"
                                            value={type}
                                            checked={viewType === type}
                                            onChange={() => setViewType(type)}
                                            className="hidden"
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Calendar Grid - Day View Only for MVP */}
                <div className="flex-1 overflow-auto bg-gray-50 relative">
                    <div className="relative min-w-max min-h-max">
                        {/* Time Column & Grid Structure */}
                        <div className="grid min-w-full" style={{ gridTemplateColumns: `80px repeat(${Math.max(1, getActiveFacilities().length)}, minmax(200px, 1fr))` }}>
                            {/* Top Left Blank */}
                            <div className="sticky top-0 left-0 z-30 bg-white border-b border-r border-[#f0f5f5] h-20"></div>

                            {/* Lane Headers */}
                            {getActiveFacilities().map(facility => (
                                <div key={facility._id} className="sticky top-0 z-20 bg-white border-b border-r border-[#f0f5f5] p-4 flex flex-col justify-center h-20 text-center">
                                    <h3 className="font-bold text-sm truncate">{facility.name}</h3>
                                    <p className="text-[10px] text-[#608a8a] uppercase tracking-wider truncate">{facility.type || 'Standard'}</p>
                                </div>
                            ))}

                            {/* Time Slots & Event Area */}
                            {hours.map(hour => (
                                <React.Fragment key={hour}>
                                    {/* Time Label */}
                                    <div className="sticky left-0 z-10 bg-white text-right pr-4 py-2 text-xs font-bold text-[#608a8a] border-b border-r border-[#f0f5f5] h-[100px] flex items-start justify-end pt-4">
                                        {`${hour}:00`}
                                    </div>

                                    {/* Lane Background Slots */}
                                    {facilities.filter(f => visibleFacilityIds.has(f._id)).map(facility => (
                                        <div key={`${facility._id}-${hour}`} className="border-b border-r border-[#f0f5f5] h-[100px] bg-white/50 hover:bg-white transition-colors"></div>
                                    ))}
                                </React.Fragment>
                            ))}
                        </div>

                        {/* True Column Layer for Events (Overlay) */}
                        <div className="absolute top-[80px] left-[80px] right-0 bottom-0 grid pointer-events-none" style={{ gridTemplateColumns: `repeat(${Math.max(1, getActiveFacilities().length)}, minmax(200px, 1fr))` }}>
                            {getActiveFacilities().map(facility => (
                                <div key={`lane-${facility._id}`} className="relative h-full pointer-events-auto">
                                    {eventsByFacility[facility._id]?.map(event => {
                                        const style = getEventStyle(event);
                                        const now = new Date();
                                        const eventEndTime = new Date(event.endTime);
                                        const isPastEvent = eventEndTime < now;
                                        const computedStatus = isPastEvent ? 'completed' : (event.status || 'scheduled');
                                        const statusColor = computedStatus === 'delayed' ? '#f59e0b' : computedStatus === 'cancelled' ? '#ef4444' : computedStatus === 'completed' ? '#10b981' : primaryColor;
                                        return (
                                            <div
                                                key={event._id}
                                                onClick={!isReadOnly ? () => { setEditingEvent(event); setCreateModalOpen(true); } : undefined}
                                                className={`absolute bg-white border-l-4 rounded-md shadow-sm p-2 flex flex-col justify-between overflow-hidden ${!isReadOnly ? 'cursor-pointer hover:shadow-md hover:z-10 group opacity-90 hover:opacity-100' : 'opacity-80'} transition-all`}
                                                style={{ ...style, borderLeftColor: statusColor }}
                                                title={`${event.title} (${format(parseISO(event.startTime), 'HH:mm')} - ${format(parseISO(event.endTime), 'HH:mm')})`}
                                            >
                                                <div>
                                                    <div className="flex items-center gap-1">
                                                        <h4 className="text-xs font-bold leading-tight truncate">{event.groupId?.name || 'Group'}</h4>
                                                        {(computedStatus === 'completed' || computedStatus === 'delayed' || computedStatus === 'cancelled') && (
                                                            <span className="text-[8px] px-1 py-0.5 rounded-full font-bold uppercase" style={{ backgroundColor: statusColor + '20', color: statusColor }}>
                                                                {computedStatus}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-[#608a8a] truncate">{event.groupId?.category || ''}</p>
                                                    {event.groupId?.coaches && event.groupId.coaches.length > 0 && (
                                                        <p className="text-[9px] text-[#608a8a] truncate mt-0.5">
                                                            👤 {event.groupId.coaches.map(c => c.fullName).join(', ')}
                                                            {event.groupId.coaches[0]?.specialty && ` (${event.groupId.coaches[0].specialty})`}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between mt-1 gap-1">
                                                    <span className="text-[9px] font-bold truncate" style={{ color: statusColor }}>
                                                        {format(parseISO(event.startTime), 'HH:mm')} - {format(parseISO(event.endTime), 'HH:mm')}
                                                    </span>
                                                    {!isReadOnly && (
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); openDelayModal(event); }}
                                                                className="opacity-0 group-hover:opacity-100 hover:text-amber-500 transition-opacity p-0.5"
                                                                title="Delay/Reschedule"
                                                            >
                                                                <span className="material-symbols-outlined text-sm">schedule</span>
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event._id, event.seriesId); }}
                                                                className="opacity-0 group-hover:opacity-100 hover:text-red-600 transition-opacity p-0.5"
                                                                title="Delete"
                                                            >
                                                                <span className="material-symbols-outlined text-sm">delete</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* FAB */}
                {!isReadOnly && (
                    <button
                        onClick={() => { setEditingEvent(null); setCreateModalOpen(true); }}
                        className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-black rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform active:scale-95 group z-50"
                        style={{ backgroundColor: primaryColor }}
                    >
                        <span className="material-symbols-outlined text-2xl group-hover:rotate-90 transition-transform">add</span>
                    </button>
                )}
            </main>

            <CreateEventModal
                isOpen={isCreateModalOpen}
                onClose={() => { setCreateModalOpen(false); setEditingEvent(null); }}
                onSubmit={handleSaveEvent}
                groups={seasonGroups}
                facilities={facilities}
                event={editingEvent}
            />

            {/* Delay Modal */}
            {isDelayModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-amber-50">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-amber-600">schedule</span>
                                <h3 className="text-lg font-black text-amber-800">Delay / Reschedule</h3>
                            </div>
                            <button onClick={() => setDelayModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 flex flex-col gap-4">
                            <p className="text-sm text-slate-600">
                                Reschedule "<strong>{delayEvent?.title || delayEvent?.groupId?.name}</strong>" to a new time:
                            </p>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Date</label>
                                <input
                                    type="date"
                                    className="w-full rounded-lg border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    value={delayData.date}
                                    onChange={(e) => setDelayData({ ...delayData, date: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Time</label>
                                    <input
                                        type="time"
                                        className="w-full rounded-lg border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                        value={delayData.startTime}
                                        onChange={(e) => setDelayData({ ...delayData, startTime: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Time</label>
                                    <input
                                        type="time"
                                        className="w-full rounded-lg border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                        value={delayData.endTime}
                                        onChange={(e) => setDelayData({ ...delayData, endTime: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                                <button
                                    onClick={() => setDelayModalOpen(false)}
                                    className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelayEvent}
                                    className="px-6 py-2 text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-lg transition-colors"
                                >
                                    Confirm Delay
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Schedule;
