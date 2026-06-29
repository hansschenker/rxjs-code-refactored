import { Observable } from '../../../upstream-rxjs/src/internal/Observable';
import { innerFrom } from '../../../upstream-rxjs/src/internal/observable/innerFrom';
import { Subscriber } from '../../../upstream-rxjs/src/internal/Subscriber';
import { ObservableInput, SchedulerLike } from '../../../upstream-rxjs/src/internal/types';
import { executeSchedule } from '../../../upstream-rxjs/src/internal/util/executeSchedule';
import { createOperatorSubscriber } from './OperatorSubscriber';

/**
 * A process embodying the general "merge" strategy. This is used in
 * `mergeMap` and `mergeScan` because the logic is otherwise nearly identical.
 * @param source The original source observable
 * @param subscriber The consumer subscriber
 * @param project The projection function to get our inner sources
 * @param concurrent The number of concurrent inner subscriptions
 * @param onBeforeNext Additional logic to apply before nexting to our consumer
 * @param expand If `true` this will perform an "expand" strategy, which differs only
 * in that it recurses, and the inner subscription must be schedule-able.
 * @param innerSubScheduler A scheduler to use to schedule inner subscriptions,
 * this is to support the expand strategy, mostly, and should be deprecated
 */
export function mergeInternals<T, R>(
  source: Observable<T>,
  subscriber: Subscriber<R>,
  project: (value: T, index: number) => ObservableInput<R>,
  concurrent: number,
  onBeforeNext?: (innerValue: R) => void,
  expand?: boolean,
  innerSubScheduler?: SchedulerLike,
  additionalFinalizer?: () => void
) {
  const buffer: T[] = [];
  let active = 0;
  let index = 0;
  let isOuterComplete = false;

  const completeIfReady = () => {
    if (isOuterComplete && !buffer.length && !active) {
      subscriber.complete();
    }
  };

  const startInnerOrBuffer = (value: T) => {
    if (active < concurrent) {
      doInnerSub(value);
    } else {
      buffer.push(value);
    }
  };

  const drainBuffer = () => {
    while (buffer.length && active < concurrent) {
      const bufferedValue = buffer.shift()!;

      if (innerSubScheduler) {
        executeSchedule(subscriber, innerSubScheduler, () => doInnerSub(bufferedValue));
      } else {
        doInnerSub(bufferedValue);
      }
    }
  };

  const emitInnerValue = (innerValue: R) => {
    onBeforeNext?.(innerValue);

    if (expand) {
      startInnerOrBuffer(innerValue as any);
    } else {
      subscriber.next(innerValue);
    }
  };

  const finalizeCompletedInner = (innerComplete: boolean) => {
    if (!innerComplete) {
      return;
    }

    try {
      active--;
      drainBuffer();
      completeIfReady();
    } catch (err) {
      subscriber.error(err);
    }
  };

  const doInnerSub = (value: T) => {
    if (expand) {
      subscriber.next(value as any);
    }

    active++;

    let innerComplete = false;

    innerFrom(project(value, index++)).subscribe(
      createOperatorSubscriber(
        subscriber,
        emitInnerValue,
        () => {
          innerComplete = true;
        },
        undefined,
        () => finalizeCompletedInner(innerComplete)
      )
    );
  };

  source.subscribe(
    createOperatorSubscriber(subscriber, startInnerOrBuffer, () => {
      isOuterComplete = true;
      completeIfReady();
    })
  );

  return () => {
    additionalFinalizer?.();
  };
}
