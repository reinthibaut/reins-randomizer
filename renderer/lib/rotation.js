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
    let pointer = 0;

    for (const task of tasks) {
      const taskName = typeof task === 'string' ? task : task.name;
      const count = typeof task === 'string' ? 1 : (task.count || 1);
      const picked = [];

      for (let slot = 0; slot < count && pointer < sorted.length; slot++) {
        const person = sorted[pointer++];
        picked.push(person);
        updatedCounts[person] = (updatedCounts[person] || 0) + 1;
      }

      assignments[taskName] = picked.join(', ');
    }

    return { assignments, updatedCounts };
  }

  return { assignTasks };
})();

if (typeof module !== 'undefined') module.exports = Rotation;
