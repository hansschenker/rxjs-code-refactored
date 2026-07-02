import { AsyncAction } from './AsyncAction';
import { Subscription } from '../../../upstream-rxjs/src/internal/Subscription';
import { QueueScheduler } from './QueueScheduler';
import { SchedulerAction } from '../../../upstream-rxjs/src/internal/types';
import { TimerHandle } from './timerHandle';

/**
 * An action for the {@link queueScheduler}: with no delay it executes
 * SYNCHRONOUSLY, but through the scheduler's flush loop — so work scheduled
 * reentrantly (from inside other queued work) is appended to the queue and
 * run in order, rather than nested. With a positive delay it degrades to
 * ordinary {@link AsyncAction} timer behavior.
 */
export class QueueAction<T> extends AsyncAction<T> {
  constructor(protected scheduler: QueueScheduler, protected work: (this: SchedulerAction<T>, state?: T) => void) {
    super(scheduler, work);
  }

  public schedule(state?: T, delay: number = 0): Subscription {
    if (delay > 0) {
      // Positive delay: behave exactly like an async (timer-based) action.
      return super.schedule(state, delay);
    }
    // No delay: skip the async machinery entirely and hand this action to the
    // scheduler's flush loop right now. If a flush is already running, the
    // action is queued behind the current one; otherwise it executes here,
    // synchronously.
    this.delay = delay;
    this.state = state;
    this.scheduler.flush(this);
    return this;
  }

  public execute(state: T, delay: number): any {
    // No delay and not closed: run the work directly, bypassing the
    // rescheduling bookkeeping that `super.execute` performs for timers.
    return delay > 0 || this.closed ? super.execute(state, delay) : this._execute(state, delay);
  }

  protected requestAsyncId(scheduler: QueueScheduler, id?: TimerHandle, delay: number = 0): TimerHandle {
    // If delay exists and is greater than 0, or if the delay is null (the
    // action wasn't rescheduled) but was originally scheduled as an async
    // action, then recycle as an async action.

    if ((delay != null && delay > 0) || (delay == null && this.delay > 0)) {
      return super.requestAsyncId(scheduler, id, delay);
    }

    // Otherwise flush the scheduler starting with this action.
    scheduler.flush(this);

    // HACK: In the past, this was returning `void`. However, `void` isn't a valid
    // `TimerHandle`, and generally the return value here isn't really used. So the
    // compromise is to return `0` which is both "falsy" and a valid `TimerHandle`,
    // as opposed to refactoring every other instanceo of `requestAsyncId`.
    return 0;
  }
}
