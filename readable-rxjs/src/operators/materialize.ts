import { Notification } from '../../../upstream-rxjs/src/internal/Notification';
import { OperatorFunction, ObservableNotification } from '../../../upstream-rxjs/src/internal/types';
import { operate } from '../../../upstream-rxjs/src/internal/util/lift';
import { createOperatorSubscriber } from './OperatorSubscriber';

/**
 * Converts source `next`, `error`, and `complete` notifications into values.
 */
export function materialize<T>(): OperatorFunction<T, Notification<T> & ObservableNotification<T>> {
  return operate((source, subscriber) => {
    const emitNextNotification = (value: T) => {
      subscriber.next(Notification.createNext(value));
    };

    const emitCompleteNotificationAndComplete = () => {
      subscriber.next(Notification.createComplete());
      subscriber.complete();
    };

    const emitErrorNotificationAndComplete = (error: any) => {
      subscriber.next(Notification.createError(error));
      subscriber.complete();
    };

    source.subscribe(
      createOperatorSubscriber(
        subscriber,
        emitNextNotification,
        emitCompleteNotificationAndComplete,
        emitErrorNotificationAndComplete
      )
    );
  });
}
