import { observeNotification } from '../../../upstream-rxjs/src/internal/Notification';
import { OperatorFunction, ObservableNotification, ValueFromNotification } from '../../../upstream-rxjs/src/internal/types';
import { operate } from '../../../upstream-rxjs/src/internal/util/lift';
import { createOperatorSubscriber } from './OperatorSubscriber';

/**
 * Converts notification values back into `next`, `error`, and `complete`.
 */
export function dematerialize<N extends ObservableNotification<any>>(): OperatorFunction<N, ValueFromNotification<N>> {
  return operate((source, subscriber) => {
    const unwrapNotification = (notification: N) => {
      observeNotification(notification, subscriber);
    };

    source.subscribe(createOperatorSubscriber(subscriber, unwrapNotification));
  });
}
