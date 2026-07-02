import { Scheduler } from '../../../upstream-rxjs/src/internal/Scheduler';
import { Action } from './Action';
import { AsyncAction } from './AsyncAction';
import { TimerHandle } from './timerHandle';

/**
 * The scheduler behind {@link asyncScheduler}: work is delayed with real JS
 * timers, one `AsyncAction` per scheduled task.
 *
 * `flush` is the heart of it. A timer firing calls `flush(action)`; if a flush
 * is already in progress (`_active`), the action is simply queued onto
 * `actions` and the running flush drains it. This keeps execution strictly
 * serial per scheduler even when actions reschedule reentrantly.
 */
export class AsyncScheduler extends Scheduler {
  public actions: Array<AsyncAction<any>> = [];
  /**
   * A flag to indicate whether the Scheduler is currently executing a batch of
   * queued actions.
   * @internal
   */
  public _active: boolean = false;
  /**
   * An internal ID used to track the latest asynchronous task such as those
   * coming from `setTimeout`, `setInterval`, `requestAnimationFrame`, and
   * others.
   * @internal
   */
  public _scheduled: TimerHandle | undefined;

  constructor(SchedulerAction: typeof Action, now: () => number = Scheduler.now) {
    super(SchedulerAction, now);
  }

  public flush(action: AsyncAction<any>): void {
    const { actions } = this;

    if (this._active) {
      // A flush is already draining the queue on this call stack; just hand
      // the action to that flush rather than executing reentrantly.
      actions.push(action);
      return;
    }

    let error: any;
    this._active = true;

    do {
      // `execute` returns a truthy error value instead of throwing.
      if ((error = action.execute(action.state, action.delay))) {
        break;
      }
    } while ((action = actions.shift()!)); // exhaust the scheduler queue

    this._active = false;

    if (error) {
      // One action failed: unsubscribe every remaining queued action (they
      // will never run) before surfacing the error to the timer callback.
      while ((action = actions.shift()!)) {
        action.unsubscribe();
      }
      throw error;
    }
  }
}
