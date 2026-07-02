// IDENTITY-PRESERVING RE-EXPORT (intentionally not rewritten).
// The upstream TestScheduler installs virtual-time delegates onto this
// provider singleton during every marble test run. A readable copy would be
// a different object, the delegates would never reach it, and readable
// scheduler actions would fire real timers inside virtual-time tests.
export * from '../../../upstream-rxjs/src/internal/scheduler/performanceTimestampProvider';
