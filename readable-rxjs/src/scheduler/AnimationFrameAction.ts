import { AsyncAction } from './AsyncAction';
import { AnimationFrameScheduler } from './AnimationFrameScheduler';
import { SchedulerAction } from '../../../upstream-rxjs/src/internal/types';
import { animationFrameProvider } from './animationFrameProvider';
import { TimerHandle } from './timerHandle';

/**
 * An action that executes on the next animation frame (via
 * `animationFrameProvider.requestAnimationFrame`).
 *
 * The crucial trick: every AnimationFrameAction scheduled with no delay before
 * the frame fires shares ONE requestAnimationFrame. The shared request id
 * lives on `scheduler._scheduled`; each action also pushes itself onto
 * `scheduler.actions`, and the single flush drains all of them in that frame.
 */
export class AnimationFrameAction<T> extends AsyncAction<T> {
  constructor(protected scheduler: AnimationFrameScheduler, protected work: (this: SchedulerAction<T>, state?: T) => void) {
    super(scheduler, work);
  }

  protected requestAsyncId(scheduler: AnimationFrameScheduler, id?: TimerHandle, delay: number = 0): TimerHandle {
    // If delay is greater than 0, request as an async action (a plain timer).
    if (delay !== null && delay > 0) {
      return super.requestAsyncId(scheduler, id, delay);
    }
    // Push the action to the end of the scheduler queue.
    scheduler.actions.push(this);
    // If an animation frame has already been requested, don't request another
    // one — reuse it, so all pending actions flush in the same frame. If an
    // animation frame hasn't been requested yet, request one. Return the
    // current animation frame request id (shared by the whole batch).
    return scheduler._scheduled || (scheduler._scheduled = animationFrameProvider.requestAnimationFrame(() => scheduler.flush(undefined)));
  }

  protected recycleAsyncId(scheduler: AnimationFrameScheduler, id?: TimerHandle, delay: number = 0): TimerHandle | undefined {
    // If delay exists and is greater than 0, or if the delay is null (the
    // action wasn't rescheduled) but was originally scheduled as an async
    // action, then recycle as an async action (clears the plain timer).
    if (delay != null ? delay > 0 : this.delay > 0) {
      return super.recycleAsyncId(scheduler, id, delay);
    }
    // If the scheduler queue has no remaining actions with the same async id,
    // cancel the requested animation frame and set the scheduled flag to
    // undefined so the next AnimationFrameAction will request its own.
    // Unlike AsapAction, the frame is only cancelled when this id is STILL the
    // scheduler's current request (`id === scheduler._scheduled`) — during a
    // flush `_scheduled` has already moved on, and cancelling then could kill
    // a newly requested frame.
    const { actions } = scheduler;
    if (id != null && id === scheduler._scheduled && actions[actions.length - 1]?.id !== id) {
      animationFrameProvider.cancelAnimationFrame(id as number);
      scheduler._scheduled = undefined;
    }
    // Return undefined so the action knows to request a new async id if it's rescheduled.
    return undefined;
  }
}
