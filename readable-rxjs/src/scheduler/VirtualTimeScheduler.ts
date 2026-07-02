import { AsyncAction } from './AsyncAction';
import { Subscription } from '../../../upstream-rxjs/src/internal/Subscription';
import { AsyncScheduler } from './AsyncScheduler';
import { SchedulerAction } from '../../../upstream-rxjs/src/internal/types';
import { TimerHandle } from './timerHandle';

export class VirtualTimeScheduler extends AsyncScheduler {
  /** @deprecated Not used in VirtualTimeScheduler directly. Will be removed in v8. */
  static frameTimeFactor = 10;

  /**
   * The current frame for the state of the virtual scheduler instance. The difference
   * between two "frames" is synonymous with the passage of "virtual time units". So if
   * you record `scheduler.frame` to be `1`, then later, observe `scheduler.frame` to be at `11`,
   * that means `10` virtual time units have passed.
   */
  public frame: number = 0;

  /**
   * Used internally to examine the current virtual action index being processed.
   * @deprecated Internal implementation detail, do not use directly. Will be made internal in v8.
   */
  public index: number = -1;

  /**
   * This creates an instance of a `VirtualTimeScheduler`. Experts only. The signature of
   * this constructor is likely to change in the long run.
   *
   * @param schedulerActionCtor The type of Action to initialize when initializing actions during scheduling.
   * @param maxFrames The maximum number of frames to process before stopping. Used to prevent endless flush cycles.
   */
  constructor(schedulerActionCtor: typeof AsyncAction = VirtualAction as any, public maxFrames: number = Infinity) {
    // The scheduler's notion of "now" is the current virtual frame, not
    // wall-clock time. Time only advances when `flush()` drains the queue.
    super(schedulerActionCtor, () => this.frame);
  }

  /**
   * Prompt the Scheduler to execute all of its queued actions, therefore
   * clearing its queue.
   */
  public flush(): void {
    const { actions, maxFrames } = this;
    let error: any;
    let action: AsyncAction<any> | undefined;

    // The queue is kept sorted by due frame, then insertion order (see
    // `VirtualAction.sortActions`), so the head is always the next action in
    // virtual time. Note that a queued VirtualAction's `delay` holds its
    // ABSOLUTE due frame (assigned in `requestAsyncId`), which is why the
    // frame can jump straight to it, and why the loop stops once the next due
    // frame exceeds `maxFrames`.
    while ((action = actions[0]) && action.delay <= maxFrames) {
      actions.shift();
      this.frame = action.delay;

      if ((error = action.execute(action.state, action.delay))) {
        break;
      }
    }

    if (error) {
      // One failed action aborts the whole flush: cancel every action still
      // queued, then surface the error to the caller.
      while ((action = actions.shift())) {
        action.unsubscribe();
      }
      throw error;
    }
  }
}

export class VirtualAction<T> extends AsyncAction<T> {
  /**
   * Whether this instance is still the "live" action for its logical task.
   * Rescheduling clones the action (see `schedule`), marking the original
   * inactive so its `_execute` becomes a no-op.
   */
  protected active: boolean = true;

  constructor(
    protected scheduler: VirtualTimeScheduler,
    protected work: (this: SchedulerAction<T>, state?: T) => void,
    protected index: number = (scheduler.index += 1)
  ) {
    super(scheduler, work);
    // Keep the scheduler's monotonic counter in sync even when an explicit
    // index is passed. The index breaks ties between actions that are due on
    // the same frame, preserving scheduling order.
    this.index = scheduler.index = index;
  }

  public schedule(state?: T, delay: number = 0): Subscription {
    if (Number.isFinite(delay)) {
      if (!this.id) {
        // First schedule of this action: take AsyncAction's normal path,
        // which lands in `requestAsyncId` below and enqueues this action.
        return super.schedule(state, delay);
      }
      this.active = false;
      // If an action is rescheduled, we save allocations by mutating its state,
      // pushing it to the end of the scheduler queue, and recycling the action.
      // But since the VirtualTimeScheduler is used for testing, VirtualActions
      // must be immutable so they can be inspected later.
      const action = new VirtualAction(this.scheduler, this.work);
      this.add(action);
      return action.schedule(state, delay);
    } else {
      // If someone schedules something with Infinity, it'll never happen. So we
      // don't even schedule it.
      return Subscription.EMPTY;
    }
  }

  protected requestAsyncId(scheduler: VirtualTimeScheduler, id?: any, delay: number = 0): TimerHandle {
    // Convert the relative delay into an absolute due frame, then keep the
    // scheduler's queue sorted so `flush` can drain it in virtual-time order.
    this.delay = scheduler.frame + delay;
    const { actions } = scheduler;
    actions.push(this);
    (actions as Array<VirtualAction<T>>).sort(VirtualAction.sortActions);
    // No real timer is set; any truthy handle satisfies AsyncAction's
    // "already scheduled" bookkeeping.
    return 1;
  }

  protected recycleAsyncId(scheduler: VirtualTimeScheduler, id?: any, delay: number = 0): TimerHandle | undefined {
    // Virtual actions never set a real timer, so there is nothing to clear or
    // recycle here.
    return undefined;
  }

  protected _execute(state: T, delay: number): any {
    // Only the "live" action runs its work; instances superseded by a
    // reschedule (see `schedule`) are silently skipped.
    if (this.active === true) {
      return super._execute(state, delay);
    }
  }

  private static sortActions<T>(a: VirtualAction<T>, b: VirtualAction<T>): number {
    // Order by due frame first; the monotonic insertion index breaks ties so
    // that actions due on the same frame execute in scheduling order.
    if (a.delay === b.delay) {
      if (a.index === b.index) {
        return 0;
      } else if (a.index > b.index) {
        return 1;
      } else {
        return -1;
      }
    } else if (a.delay > b.delay) {
      return 1;
    } else {
      return -1;
    }
  }
}
