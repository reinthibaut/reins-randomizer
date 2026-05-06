const _utils = (typeof Utils !== 'undefined') ? Utils : require('./utils');
const _rotation = (typeof Rotation !== 'undefined') ? Rotation : require('./rotation');

const Scheduler = (function () {
  // completedEntries: array of already-completed schedule entries to preserve.
  // Returns { schedule, pickCounts } — schedule covers the full school year.
  function generateSchedule(template, entries, completedEntries) {
    const allDates = _utils.getAllMatchingDates(
      template.schoolYearStart,
      template.schoolYearEnd,
      template.scheduleDays,
      template.vacations
    );

    // Index completed entries by date so we can look them up fast
    const completedByDate = {};
    let pickCounts = {};

    for (const entry of completedEntries) {
      completedByDate[entry.date] = entry;
      // Tally picks from completed entries to maintain fairness
      for (const studentStr of Object.values(entry.assignments)) {
        for (const student of studentStr.split(', ')) {
          pickCounts[student] = (pickCounts[student] || 0) + 1;
        }
      }
    }

    // Ensure all current entries start at 0 if not yet tracked
    for (const entry of entries) {
      if (pickCounts[entry] === undefined) pickCounts[entry] = 0;
    }

    const schedule = allDates.map(date => {
      if (completedByDate[date]) {
        return completedByDate[date];
      }
      const { assignments, updatedCounts } = _rotation.assignTasks(template.tasks, entries, pickCounts);
      pickCounts = updatedCounts;
      return { date, assignments, status: 'upcoming' };
    });

    return { schedule, pickCounts };
  }

  return { generateSchedule };
})();

if (typeof module !== 'undefined') module.exports = Scheduler;
