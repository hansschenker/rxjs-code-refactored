import { Action } from './Action';
import { SchedulerAction } from '../../../upstream-rxjs/src/internal/types';
import { Subscription } from '../../../upstream-rxjs/src/internal/Subscription';
import { AsyncScheduler } from './AsyncScheduler';
import { intervalProvider } from './intervalProvider';
import { arrRemove } from '../../../upstream-rxjs/src/internal/util/arrRemove';
import { TimerHandle } from './timerHandle';

/**
 * The action used by the {@link asyncScheduler}: one scheduled unit of work
 * backed by a real JS timer (via `intervalProvider`).
 *
 * Lifecycle at a glance:
 *
 * - `schedule(state, delay)` stores the state, arms (or reuses) a timer, and
 *   sets `pending = true`.
 * - When the timer fires, the scheduler calls `execute(state, delay)`, which
 *   clears `pending` and runs the user `work`. If `work` rescheduled the
 *   action (setting `pending` back to `true`), the underlying interval keeps
 *   running; otherwise the timer id is recycled.
 * - `unsubscribe()` cancels the timer, removes the action from the
 *   scheduler's queue, and severs references so the action can be GC'd.
 */
export class AsyncAction<T> extends Action<T> {
  /** The handle of the underlying timer, while one is armed. */
  public id: TimerHandle | undefined;
  /** The state that will be passed to `work` on the next execution. */
  public state?: T;
  // @ts-ignore: Property has no initializer and is not definitely assigned
  public delay: number;
  /**
   * True from the moment the action is scheduled (or reschedules itself from
   * inside `work`) until `execute` begins running it. Both the timer-reuse
   * logic in `recycleAsyncId` and the "should I keep my interval?" check in
   * `execute` hinge on this flag.
   */
  protected pending: boolean = false;

  constructor(protected scheduler: AsyncScheduler, protected work: (this: SchedulerAction<T>, state?: T) => void) {
    super(scheduler, work);
  }

  public schedule(state?: T, delay: number = 0): Subscription {
    if (this.closed) {
      return this;
    }

    // Always replace the current state with the new state.
    this.state = state;

    const id = this.id;
    const scheduler = this.scheduler;

    //
    // Important implementation note:
    //
    // Actions only execute once by default, unless rescheduled from within the
    // scheduled callback. This allows us to implement single and repeat
    // actions via the same code path, without adding API surface area, as well
    // as mimic traditional recursion but across asynchronous boundaries.
    //
    // However, JS runtimes and timers distinguish between intervals achieved by
    // serial `setTimeout` calls vs. a single `setInterval` call. An interval of
    // serial `setTimeout` calls can be individually delayed, which delays
    // scheduling the next `setTimeout`, and so on. `setInterval` attempts to
    // guarantee the interval callback will be invoked more precisely to the
    // interval period, regardless of load.
    //
    // Therefore, we use `setInterval` to schedule single and repeat actions.
    // If the action reschedules itself with the same delay, the interval is not
    // canceled. If the action doesn't reschedule, or reschedules with a
    // different delay, the interval will be canceled after scheduled callback
    // execution.
    //
    if (id != null) {
      // A timer is already armed. `recycleAsyncId` decides whether it can be
      // reused for this (re)schedule: it returns the same id to keep the
      // interval running, or `undefined` after clearing it.
      this.id = this.recycleAsyncId(scheduler, id, delay);
    }

    // Set the pending flag indicating that this action has been scheduled, or
    // has recursively rescheduled itself.
    this.pending = true;

    this.delay = delay;
    // If this action has already an async Id, don't request a new one.
    this.id = this.id ?? this.requestAsyncId(scheduler, this.id, delay);

    return this;
  }

  protected requestAsyncId(scheduler: AsyncScheduler, _id?: TimerHandle, delay: number = 0): TimerHandle {
    // When the interval fires it hands this action back to the scheduler,
    // which drains its queue starting with this action (see AsyncScheduler.flush).
    return intervalProvider.setInterval(scheduler.flush.bind(scheduler, this), delay);
  }

  protected recycleAsyncId(_scheduler: AsyncScheduler, id?: TimerHandle, delay: number | null = 0): TimerHandle | undefined {
    // If this action is rescheduled with the same delay time, don't clear the interval id.
    // (`pending === false` means we are inside `execute` after the timer fired —
    // i.e. the action is being rescheduled from within its own `work` — so the
    // still-running interval already ticks at exactly this delay and can be kept.)
    if (delay != null && this.delay === delay && this.pending === false) {
      return id;
    }
    // Otherwise, if the action's delay time is different from the current delay,
    // or the action has been rescheduled before it's executed, clear the interval id
    if (id != null) {
      intervalProvider.clearInterval(id);
    }

    return undefined;
  }

  /**
   * Immediately executes this action and the `work` it contains.
   *
   * Errors are RETURNED, not thrown: a truthy return value signals failure to
   * `AsyncScheduler.flush`, which is responsible for cleaning up the queue and
   * rethrowing.
   */
  public execute(state: T, delay: number): any {
    if (this.closed) {
      return new Error('executing a cancelled action');
    }

    this.pending = false;
    const error = this._execute(state, delay);
    if (error) {
      return error;
    } else if (this.pending === false && this.id != null) {
      // Dequeue if the action didn't reschedule itself. Don't call
      // unsubscribe(), because the action could reschedule later.
      // For example:
      // ```
      // scheduler.schedule(function doWork(counter) {
      //   /* ... I'm a busy worker bee ... */
      //   var originalAction = this;
      //   /* wait 100ms before rescheduling the action */
      //   setTimeout(function () {
      //     originalAction.schedule(counter + 1);
      //   }, 100);
      // }, 1000);
      // ```
      this.id = this.recycleAsyncId(this.scheduler, this.id, null);
    }
  }

  protected _execute(state: T, _delay: number): any {
    let errored: boolean = false;
    let errorValue: any;
    try {
      // `work` is invoked with the action itself as `this`, so user code can
      // reschedule via `this.schedule(...)` (see the SchedulerAction type).
      this.work(state);
    } catch (e) {
      errored = true;
      // HACK: Since code elsewhere is relying on the "truthiness" of the
      // return here, we can't have it return "" or 0 or false.
      // TODO: Clean this up when we refactor schedulers mid-version-8 or so.
      errorValue = e ? e : new Error('Scheduled action threw falsy error');
    }
    if (errored) {
      // A failed action must not fire again: unsubscribe FIRST (cancelling the
      // timer and dequeuing), then hand the error back to the caller.
      this.unsubscribe();
      return errorValue;
    }
  }

  unsubscribe() {
    if (!this.closed) {
      const { id, scheduler } = this;
      const { actions } = scheduler;

      // Sever references before touching the scheduler so the action drops
      // its retained state even if it lingers somewhere.
      this.work = this.state = this.scheduler = null!;
      this.pending = false;

      // Remove this action from the scheduler's pending queue, and cancel the
      // timer (delay `null` never matches `this.delay`, so `recycleAsyncId`
      // always clears the interval here).
      arrRemove(actions, this);
      if (id != null) {
        this.id = this.recycleAsyncId(scheduler, id, null);
      }

      this.delay = null!;
      super.unsubscribe();
    }
  }
}
