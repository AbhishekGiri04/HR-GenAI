const moment = require('moment');

class AutoInterviewScheduler {
    constructor() {
        // Default configuration - can be made dynamic
        this.dailyCapacity = 10; // interviews per day
        this.interviewDuration = 60; // minutes
        this.workingHours = {
            start: 9, // 9 AM
            end: 17   // 5 PM
        };
        this.workingDays = [1, 2, 3, 4, 5]; // Monday to Friday
        this.scheduledInterviews = new Map(); // date -> count
    }

    // Get next available slot within date range
    getNextAvailableSlotInRange(startDate, endDate) {
        let currentDate = moment(startDate);
        const endMoment = moment(endDate);
        
        while (currentDate.isSameOrBefore(endMoment)) {
            // Skip weekends
            if (!this.workingDays.includes(currentDate.day())) {
                currentDate.add(1, 'day');
                continue;
            }

            const dateKey = currentDate.format('YYYY-MM-DD');
            const scheduledCount = this.scheduledInterviews.get(dateKey) || 0;

            if (scheduledCount < this.dailyCapacity) {
                // Calculate time slot
                const timeSlot = this.calculateTimeSlot(scheduledCount);
                return {
                    date: dateKey,
                    time: timeSlot,
                    datetime: `${dateKey} ${timeSlot}`,
                    slotNumber: scheduledCount + 1
                };
            }

            currentDate.add(1, 'day');
        }

        // If no slot found in range, return next available slot
        return this.getNextAvailableSlot();
    }

    // Get next available slot
    getNextAvailableSlot() {
        let currentDate = moment().add(1, 'day'); // Start from tomorrow
        
        while (true) {
            // Skip weekends
            if (!this.workingDays.includes(currentDate.day())) {
                currentDate.add(1, 'day');
                continue;
            }

            const dateKey = currentDate.format('YYYY-MM-DD');
            const scheduledCount = this.scheduledInterviews.get(dateKey) || 0;

            if (scheduledCount < this.dailyCapacity) {
                // Calculate time slot
                const timeSlot = this.calculateTimeSlot(scheduledCount);
                return {
                    date: dateKey,
                    time: timeSlot,
                    datetime: `${dateKey} ${timeSlot}`,
                    slotNumber: scheduledCount + 1
                };
            }

            currentDate.add(1, 'day');
        }
    }

    // Calculate time slot based on slot number
    calculateTimeSlot(slotNumber) {
        const slotsPerHour = 60 / this.interviewDuration;
        const totalWorkingHours = this.workingHours.end - this.workingHours.start;
        const totalSlots = totalWorkingHours * slotsPerHour;

        if (slotNumber >= totalSlots) {
            // Fallback to first slot if overflow
            slotNumber = 0;
        }

        const hourOffset = Math.floor(slotNumber / slotsPerHour);
        const minuteOffset = (slotNumber % slotsPerHour) * this.interviewDuration;
        
        const hour = this.workingHours.start + hourOffset;
        const minute = minuteOffset;

        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }

    // Book a slot
    bookSlot(date) {
        const currentCount = this.scheduledInterviews.get(date) || 0;
        this.scheduledInterviews.set(date, currentCount + 1);
    }

    // Get available slots for a specific date
    getAvailableSlotsForDate(date) {
        const scheduledCount = this.scheduledInterviews.get(date) || 0;
        const availableSlots = [];

        for (let i = scheduledCount; i < this.dailyCapacity; i++) {
            availableSlots.push({
                time: this.calculateTimeSlot(i),
                slotNumber: i + 1
            });
        }

        return availableSlots;
    }

    // Update daily capacity
    setDailyCapacity(capacity) {
        this.dailyCapacity = capacity;
    }

    // Get schedule summary
    getScheduleSummary(days = 7) {
        const summary = [];
        let currentDate = moment();

        for (let i = 0; i < days; i++) {
            const dateKey = currentDate.format('YYYY-MM-DD');
            const scheduledCount = this.scheduledInterviews.get(dateKey) || 0;
            
            summary.push({
                date: dateKey,
                dayName: currentDate.format('dddd'),
                scheduled: scheduledCount,
                available: this.dailyCapacity - scheduledCount,
                capacity: this.dailyCapacity
            });

            currentDate.add(1, 'day');
        }

        return summary;
    }
}

module.exports = AutoInterviewScheduler;