import { Observable } from '../../../upstream-rxjs/src/internal/Observable';
import { Subscriber } from '../../../upstream-rxjs/src/internal/Subscriber';
import { Subscribable } from '../../../upstream-rxjs/src/internal/types';

/**
 * Used to convert a subscribable to an observable.
 *
 * Currently, this is only used within internals.
 *
 * TODO: Discuss ObservableInput supporting "Subscribable".
 * https://github.com/ReactiveX/rxjs/issues/5909
 *
 * @param subscribable A subscribable
 */
export function fromSubscribable<T>(subscribable: Subscribable<T>) {
  // The subscriber itself is a full Observer, so it can be handed
  // directly to the subscribable.
  return new Observable((subscriber: Subscriber<T>) => subscribable.subscribe(subscriber));
}
