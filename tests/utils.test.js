const Utils = require('../renderer/lib/utils');

test('getISOWeekday returns 3 for a Wednesday', () => {
  expect(Utils.getISOWeekday('2026-05-06')).toBe(3);
});

test('getISOWeekday returns 7 for a Sunday', () => {
  expect(Utils.getISOWeekday('2026-05-10')).toBe(7);
});

test('getISOWeekday returns 1 for a Monday', () => {
  expect(Utils.getISOWeekday('2026-05-04')).toBe(1);
});

test('addDays adds days correctly', () => {
  expect(Utils.addDays('2026-05-06', 1)).toBe('2026-05-07');
  expect(Utils.addDays('2026-05-31', 1)).toBe('2026-06-01');
});

test('isInVacation returns true when date falls inside a vacation block', () => {
  const vacations = [{ from: '2026-05-04', to: '2026-05-08' }];
  expect(Utils.isInVacation('2026-05-06', vacations)).toBe(true);
  expect(Utils.isInVacation('2026-05-04', vacations)).toBe(true);
  expect(Utils.isInVacation('2026-05-08', vacations)).toBe(true);
});

test('isInVacation returns false when date is outside all vacation blocks', () => {
  const vacations = [{ from: '2026-05-04', to: '2026-05-08' }];
  expect(Utils.isInVacation('2026-05-03', vacations)).toBe(false);
  expect(Utils.isInVacation('2026-05-09', vacations)).toBe(false);
});

test('getAllMatchingDates returns all Wednesdays in a range', () => {
  const result = Utils.getAllMatchingDates('2026-05-04', '2026-05-20', [3], []);
  expect(result).toEqual(['2026-05-06', '2026-05-13', '2026-05-20']);
});

test('getAllMatchingDates skips dates inside vacation blocks', () => {
  const vacations = [{ from: '2026-05-13', to: '2026-05-13' }];
  const result = Utils.getAllMatchingDates('2026-05-04', '2026-05-20', [3], vacations);
  expect(result).toEqual(['2026-05-06', '2026-05-20']);
});

test('getAllMatchingDates supports multiple schedule days', () => {
  const result = Utils.getAllMatchingDates('2026-05-04', '2026-05-08', [1, 5], []);
  // Monday May 4 and Friday May 8
  expect(result).toEqual(['2026-05-04', '2026-05-08']);
});

test('generateId returns a non-empty string', () => {
  const id = Utils.generateId();
  expect(typeof id).toBe('string');
  expect(id.length).toBeGreaterThan(0);
});

test('generateId returns unique values', () => {
  const a = Utils.generateId();
  const b = Utils.generateId();
  expect(a).not.toBe(b);
});
