import { AsyncAction } from './AsyncAction';
import { AsyncScheduler } from './AsyncScheduler';

/**
 * The scheduler behind {@link asapScheduler}. Zero-delay actions scheduled in
 * the same synchronous pass are batched onto a single microtask (see
 * {@link AsapAction}); this `flush` drains exactly that batch.
 */
export class AsapScheduler extends AsyncScheduler {
  public flush(action?: AsyncAction<any>): void {
    this._active = true;
    // The async id that effects a call to flush is stored in _scheduled.
    // Before executing an action, it's necessary to check the action's async
    // id to determine whether it's supposed to be executed in the current
    // flush.
    // Previous implementations of this method used a count to determine this,
    // but that was unsound, as actions that are unsubscribed - i.e. cancelled -
    // are removed from the actions array and that can shift actions that are
    // scheduled to be executed in a subsequent flush into positions at which
    // they are executed within the current flush.
    //
    // Note that `_scheduled` is cleared BEFORE draining the queue: any action
    // scheduled by work running inside this flush must request a fresh
    // microtask (and gets a new id, so the loop below leaves it queued).
    const flushId = this._scheduled;
    this._scheduled = undefined;

    const { actions } = this;
    let error: any;
    action = action || actions.shift()!;

    // Execute the batch: keep draining while the head of the queue still
    // belongs to this flush (same async id) — or stop early on error.
    do {
      if ((error = action.execute(action.state, action.delay))) {
        break;
      }
    } while ((action = actions[0]) && action.id === flushId && actions.shift());

    this._active = false;

    if (error) {
      // On error, unsubscribe the REMAINDER of this batch so no half-flushed
      // actions linger, then re-throw the original error.
      while ((action = actions[0]) && action.id === flushId && actions.shift()) {
        action.unsubscribe();
      }
      throw error;
    }
  }
}
