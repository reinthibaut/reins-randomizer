const Rotation = (function () {
  // Assigns tasks to the N entries with the lowest pick counts.
  // Ties are broken randomly. Returns new assignments and updated pick counts.
  function assignTasks(tasks, entries, pickCounts) {
    const sorted = [...entries].sort((a, b) => {
      const diff = (pickCounts[a] || 0) - (pickCounts[b] || 0);
      return diff !== 0 ? diff : Math.random() - 0.5;
    });

    const assignments = {};
    const updatedCounts = { ...pickCounts };

    for (let i = 0; i < tasks.length; i++) {
      const student = sorted[i];
      assignments[tasks[i]] = student;
      updatedCounts[student] = (updatedCounts[student] || 0) + 1;
    }

    return { assignments, updatedCounts };
  }

  return { assignTasks };
})();

if (typeof module !== 'undefined') module.exports = Rotation;
