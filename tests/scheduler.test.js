global.Utils = require('../renderer/lib/utils');
global.Rotation = require('../renderer/lib/rotation');
const Scheduler = require('../renderer/lib/scheduler');

const baseTemplate = {
  tasks: ['vegen', 'vuilbakken', 'stoelen'],
  scheduleDays: [3], // Wednesday
  schoolYearStart: '2026-05-06',
  schoolYearEnd: '2026-05-20',
  vacations: [],
};
const entries = ['Rein', 'Lisa', 'Tom', 'Jan'];

test('generates one entry per matching weekday', () => {
  const { schedule } = Scheduler.generateSchedule(baseTemplate, entries, []);
  // Wednesdays May 6, 13, 20
  expect(schedule).toHaveLength(3);
  expect(schedule.map(s => s.date)).toEqual(['2026-05-06', '2026-05-13', '2026-05-20']);
});

test('all generated entries have status upcoming', () => {
  const { schedule } = Scheduler.generateSchedule(baseTemplate, entries, []);
  expect(schedule.every(s => s.status === 'upcoming')).toBe(true);
});

test('each entry has assignments for all tasks', () => {
  const { schedule } = Scheduler.generateSchedule(baseTemplate, entries, []);
  for (const entry of schedule) {
    expect(Object.keys(entry.assignments).sort()).toEqual(['stoelen', 'vegen', 'vuilbakken']);
  }
});

test('skips dates inside vacation blocks', () => {
  const template = { ...baseTemplate, vacations: [{ from: '2026-05-13', to: '2026-05-13' }] };
  const { schedule } = Scheduler.generateSchedule(template, entries, []);
  expect(schedule).toHaveLength(2);
  expect(schedule.map(s => s.date)).not.toContain('2026-05-13');
});

test('preserves completed entries and recalculates from their pick counts', () => {
  const completedEntries = [
    {
      date: '2026-05-06',
      assignments: { vegen: 'Rein', vuilbakken: 'Lisa', stoelen: 'Tom' },
      status: 'completed',
    },
  ];
  const { schedule } = Scheduler.generateSchedule(baseTemplate, entries, completedEntries);

  // First entry stays completed as-is
  expect(schedule[0].status).toBe('completed');
  expect(schedule[0].assignments['vegen']).toBe('Rein');

  // Remaining entries are upcoming
  expect(schedule[1].status).toBe('upcoming');
  expect(schedule[2].status).toBe('upcoming');

  // Rein, Lisa, Tom were each picked once — Jan (0 picks) should come first in next rounds
  expect(schedule[1].assignments['vegen']).toBe('Jan');
});

test('returns pickCounts summing all schedule entries', () => {
  const { pickCounts } = Scheduler.generateSchedule(baseTemplate, ['Rein', 'Lisa', 'Tom'], []);
  // 3 dates, 3 tasks each, 3 students — each student picked exactly 3 times total
  const total = Object.values(pickCounts).reduce((a, b) => a + b, 0);
  expect(total).toBe(9); // 3 dates × 3 picks per date
});
