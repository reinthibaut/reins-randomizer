const Rotation = require('../renderer/lib/rotation');

test('assigns tasks to entries with the lowest pick counts', () => {
  const tasks = ['vegen', 'vuilbakken', 'stoelen'];
  const entries = ['Rein', 'Lisa', 'Tom', 'Jan'];
  const pickCounts = { Rein: 3, Lisa: 1, Tom: 1, Jan: 0 };

  const { assignments } = Rotation.assignTasks(tasks, entries, pickCounts);

  // Jan has 0 picks — must be first
  expect(assignments['vegen']).toBe('Jan');
  // Lisa and Tom both have 1 pick — they get the remaining two tasks (order random)
  expect(['Lisa', 'Tom']).toContain(assignments['vuilbakken']);
  expect(['Lisa', 'Tom']).toContain(assignments['stoelen']);
  expect(assignments['vuilbakken']).not.toBe(assignments['stoelen']);
});

test('increments pick counts for assigned students only', () => {
  const tasks = ['vegen'];
  const entries = ['Rein', 'Lisa'];
  const pickCounts = { Rein: 0, Lisa: 1 };

  const { updatedCounts } = Rotation.assignTasks(tasks, entries, pickCounts);

  expect(updatedCounts['Rein']).toBe(1);
  expect(updatedCounts['Lisa']).toBe(1); // not picked, unchanged
});

test('treats missing pick count as 0', () => {
  const tasks = ['vegen'];
  const entries = ['Rein', 'Lisa'];
  const pickCounts = { Lisa: 5 }; // Rein missing from pickCounts

  const { assignments } = Rotation.assignTasks(tasks, entries, pickCounts);

  expect(assignments['vegen']).toBe('Rein');
});

test('does not mutate the original pickCounts object', () => {
  const tasks = ['vegen'];
  const entries = ['Rein'];
  const pickCounts = { Rein: 0 };

  Rotation.assignTasks(tasks, entries, pickCounts);

  expect(pickCounts['Rein']).toBe(0); // original unchanged
});
