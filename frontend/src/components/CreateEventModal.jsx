import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSeason } from '../context/SeasonContext';
import { format, getDay, setDay, addDays, startOfToday, isBefore, parseISO } from 'date-fns';

const CreateEventModal = ({ isOpen, onClose, onSubmit, groups, facilities, event }) => {
    const { team } = useAuth();
    const { selectedSeason } = useSeason();
    const primaryColor = team?.primaryColor || "#0df2f2";

    const [formData, setFormData] = useState({
        title: '',
        groupId: '',
        facilityId: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        startTime: '08:00',
        endTime: '09:30',
        type: 'regular'
    });

    const [submitting, setSubmitting] = useState(false);
    const [validationError, setValidationError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (event) {
                // Edit Mode
                setFormData({
                    title: event.title,
                    groupId: event.groupId?._id || event.groupId,
                    facilityId: event.facilityId?._id || event.facilityId,
                    date: format(new Date(event.startTime), 'yyyy-MM-dd'),
                    startTime: format(new Date(event.startTime), 'HH:mm'),
                    endTime: format(new Date(event.endTime), 'HH:mm'),
                    type: event.type || 'regular'
                });
            } else {
                // Create Mode - Reset
                const now = new Date();
                setFormData({
                    title: '',
                    groupId: '',
                    facilityId: '',
                    date: format(now, 'yyyy-MM-dd'),
                    startTime: '08:00', // Default
                    endTime: '09:30',
                    type: 'regular'
                });
            }
            setValidationError('');
        }
    }, [isOpen, event]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidationError('');

        // Basic validation
        if (!formData.groupId || !formData.facilityId) {
            setValidationError('Please select a group and facility.');
            return;
        }

        if (formData.startTime >= formData.endTime) {
            setValidationError('End time must be after start time.');
            return;
        }

        setSubmitting(true);

        // Auto-fill title with facility name if no title provided
        let eventTitle = formData.title;
        if (!eventTitle || eventTitle.trim() === '') {
            const selectedFacility = facilities.find(f => f._id === formData.facilityId);
            eventTitle = selectedFacility?.name || 'Training Session';
        }

        const eventData = {
            ...formData,
            title: eventTitle,
            ...formData,
            // Combine date and times into full ISO strings for backend
            startTime: new Date(`${formData.date}T${formData.startTime}:00`),
            endTime: new Date(`${formData.date}T${formData.endTime}:00`),
            seasonId: selectedSeason._id
        };

        try {
            await onSubmit(eventData);
            onClose();
            // Reset sensitive fields
            setFormData(prev => ({ ...prev, title: '', groupId: '' }));
        } catch (err) {
            console.error(err);
            setValidationError(err.response?.data?.message || 'Failed to create event. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <h3 className="text-lg font-black text-[#111818]">{event ? 'Edit Session' : 'Schedule Session'}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto">
                    {/* Event Type Toggle */}
                    <div className="flex gap-4 p-1 bg-slate-100 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: 'regular' })}
                            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${formData.type === 'regular' ? 'bg-white shadow text-[#111818]' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Regular Session
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: 'weekly' })}
                            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${formData.type === 'weekly' ? 'bg-white shadow text-[#111818]' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Weekly Series
                        </button>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Session Title <span className="text-slate-400">(optional)</span></label>
                        <input
                            type="text"
                            className="w-full rounded-lg border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-offset-0 transition-shadow"
                            style={{ "--tw-ring-color": primaryColor, borderColor: "rgb(226, 232, 240)" }}
                            placeholder="Leave empty to use facility name"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Group */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Group</label>
                            <select
                                required
                                className="w-full rounded-lg border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-offset-0 transition-shadow"
                                style={{ "--tw-ring-color": primaryColor, borderColor: "rgb(226, 232, 240)" }}
                                value={formData.groupId}
                                onChange={e => setFormData({ ...formData, groupId: e.target.value })}
                            >
                                <option value="">Select Group</option>
                                {groups.map(g => (
                                    <option key={g._id} value={g._id}>{g.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Facilities */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Facilities</label>
                            <select
                                required
                                className="w-full rounded-lg border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-offset-0 transition-shadow"
                                style={{ "--tw-ring-color": primaryColor, borderColor: "rgb(226, 232, 240)" }}
                                value={formData.facilityId}
                                onChange={e => setFormData({ ...formData, facilityId: e.target.value })}
                            >
                                <option value="">Select Facility</option>
                                {facilities.map(f => (
                                    <option key={f._id} value={f._id}>{f.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {/* Date */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
                            <input
                                type="date"
                                required
                                className="w-full rounded-lg border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-offset-0"
                                style={{ "--tw-ring-color": primaryColor, borderColor: "rgb(226, 232, 240)" }}
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>

                        {/* Start Time */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start</label>
                            <input
                                type="time"
                                required
                                className="w-full rounded-lg border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-offset-0"
                                style={{ "--tw-ring-color": primaryColor, borderColor: "rgb(226, 232, 240)" }}
                                value={formData.startTime}
                                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                            />
                        </div>

                        {/* End Time */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End</label>
                            <input
                                type="time"
                                required
                                className="w-full rounded-lg border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-offset-0"
                                style={{ "--tw-ring-color": primaryColor, borderColor: "rgb(226, 232, 240)" }}
                                value={formData.endTime}
                                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Weekly Options: Day of Week Selection */}
                    {formData.type === 'weekly' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Day of Week</label>
                                <select
                                    className="w-full rounded-lg border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-offset-0 transition-shadow"
                                    style={{ "--tw-ring-color": primaryColor, borderColor: "rgb(226, 232, 240)" }}
                                    value={getDay(parseISO(formData.date))}
                                    onChange={(e) => {
                                        const dayIndex = parseInt(e.target.value);
                                        const current = parseISO(formData.date);
                                        // Set the day of the current week
                                        let nextDate = setDay(current, dayIndex);

                                        // If the resulting date is before today (and it's not the same day), move to next week
                                        if (isBefore(nextDate, startOfToday()) && format(nextDate, 'yyyy-MM-dd') !== format(startOfToday(), 'yyyy-MM-dd')) {
                                            nextDate = addDays(nextDate, 7);
                                        }

                                        setFormData({ ...formData, date: format(nextDate, 'yyyy-MM-dd') });
                                    }}
                                >
                                    {[0, 1, 2, 3, 4, 5, 6].map(d => {
                                        // Generate label (e.g., Sunday, Monday...)
                                        // Using a dummy date (e.g. 2024-01-07 is Sunday)
                                        const label = format(setDay(new Date('2024-01-07'), d), 'EEEE');
                                        return <option key={d} value={d}>{label}</option>;
                                    })}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Weekly Info */}
                    {formData.type === 'weekly' && selectedSeason && (
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-3 items-start">
                            <span className="material-symbols-outlined text-blue-500">repeat</span>
                            <div className="text-xs text-blue-800">
                                <p className="font-bold">Weekly Series</p>
                                <p>This session will repeat every week until the season ends on <span className="font-bold">{new Date(selectedSeason.endDate).toLocaleDateString()}</span>.</p>
                            </div>
                        </div>
                    )}

                    {validationError && (
                        <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-lg border border-red-100 flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">error</span>
                            {validationError}
                        </div>
                    )}

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2 text-sm font-bold text-[#111818] rounded-lg shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                            style={{ backgroundColor: primaryColor }}
                        >
                            {submitting ? 'Scheduling...' : 'Confirm Schedule'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEventModal;
