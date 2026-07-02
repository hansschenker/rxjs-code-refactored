import { AsyncScheduler } from './AsyncScheduler';

/**
 * The scheduler behind {@link queueScheduler}. It adds no behavior of its
 * own: the synchronous, queue-on-reentrancy semantics live entirely in
 * {@link QueueAction} (which calls straight into the inherited
 * `AsyncScheduler.flush` for zero-delay work). The subclass exists so queue
 * actions have their own scheduler type to be bound to.
 */
export class QueueScheduler extends AsyncScheduler {
}
