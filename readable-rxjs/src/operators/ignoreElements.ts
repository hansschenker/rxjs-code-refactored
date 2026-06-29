import { OperatorFunction } from '../../../upstream-rxjs/src/internal/types';
import { operate } from '../../../upstream-rxjs/src/internal/util/lift';
import { createOperatorSubscriber } from './OperatorSubscriber';
import { noop } from '../../../upstream-rxjs/src/internal/util/noop';

/**
 * Drops every `next` notification and forwards only `error` or `complete`.
 */
export function ignoreElements(): OperatorFunction<unknown, never> {
  return operate((source, subscriber) => {
    const ignoreNext = noop;

    source.subscribe(createOperatorSubscriber(subscriber, ignoreNext));
  });
}
