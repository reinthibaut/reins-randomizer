const Utils = (function () {
  function generateId() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  // Returns ISO weekday: 1=Monday ... 7=Sunday
  function getISOWeekday(dateStr) {
    const day = new Date(dateStr + 'T00:00:00Z').getUTCDay(); // 0=Sun ... 6=Sat
    return day === 0 ? 7 : day;
  }

  // Returns "YYYY-MM-DD" string
  function formatDate(d) {
    return d.toISOString().slice(0, 10);
  }

  function addDays(dateStr, n) {
    const d = new Date(dateStr + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + n);
    return formatDate(d);
  }

  function isInVacation(dateStr, vacations) {
    return vacations.some(v => dateStr >= v.from && dateStr <= v.to);
  }

  // Returns all dates in [startStr, endStr] matching scheduleDays and not in vacations
  function getAllMatchingDates(startStr, endStr, scheduleDays, vacations) {
    const dates = [];
    let current = startStr;
    while (current <= endStr) {
      if (scheduleDays.includes(getISOWeekday(current)) && !isInVacation(current, vacations)) {
        dates.push(current);
      }
      current = addDays(current, 1);
    }
    return dates;
  }

  return { generateId, getISOWeekday, formatDate, addDays, isInVacation, getAllMatchingDates };
})();

if (typeof module !== 'undefined') module.exports = Utils;
