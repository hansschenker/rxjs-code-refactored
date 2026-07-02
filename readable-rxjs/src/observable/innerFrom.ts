import { isArrayLike } from '../../../upstream-rxjs/src/internal/util/isArrayLike';
import { isPromise } from '../../../upstream-rxjs/src/internal/util/isPromise';
import { Observable } from '../../../upstream-rxjs/src/internal/Observable';
import { ObservableInput, ObservedValueOf, ReadableStreamLike } from '../../../upstream-rxjs/src/internal/types';
import { isInteropObservable } from '../../../upstream-rxjs/src/internal/util/isInteropObservable';
import { isAsyncIterable } from '../../../upstream-rxjs/src/internal/util/isAsyncIterable';
import { createInvalidObservableTypeError } from '../../../upstream-rxjs/src/internal/util/throwUnobservableError';
import { isIterable } from '../../../upstream-rxjs/src/internal/util/isIterable';
import { isReadableStreamLike, readableStreamLikeToAsyncGenerator } from '../../../upstream-rxjs/src/internal/util/isReadableStreamLike';
import { Subscriber } from '../../../upstream-rxjs/src/internal/Subscriber';
import { isFunction } from '../../../upstream-rxjs/src/internal/util/isFunction';
import { reportUnhandledError } from '../../../upstream-rxjs/src/internal/util/reportUnhandledError';
import { observable as Symbol_observable } from '../../../upstream-rxjs/src/internal/symbol/observable';

export function innerFrom<O extends ObservableInput<any>>(input: O): Observable<ObservedValueOf<O>>;
export function innerFrom<T>(input: ObservableInput<T>): Observable<T> {
  if (input instanceof Observable) {
    return input;
  }
  if (input != null) {
    // Behavior note: the order of these checks is significant and must match
    // upstream. An input may satisfy several of these shapes at once (for
    // example, an object could be both interop-observable and iterable); the
    // first matching conversion wins.
    if (isInteropObservable(input)) {
      return fromInteropObservable(input);
    }
    if (isArrayLike(input)) {
      return fromArrayLike(input);
    }
    if (isPromise(input)) {
      return fromPromise(input);
    }
    if (isAsyncIterable(input)) {
      return fromAsyncIterable(input);
    }
    if (isIterable(input)) {
      return fromIterable(input);
    }
    if (isReadableStreamLike(input)) {
      return fromReadableStreamLike(input);
    }
  }

  throw createInvalidObservableTypeError(input);
}

/**
 * Creates an RxJS Observable from an object that implements `Symbol.observable`.
 * @param obj An object that properly implements `Symbol.observable`.
 */
export function fromInteropObservable<T>(obj: any): Observable<T> {
  return new Observable((subscriber: Subscriber<T>) => {
    const interopObservable = obj[Symbol_observable]();
    if (isFunction(interopObservable.subscribe)) {
      return interopObservable.subscribe(subscriber);
    }
    // Should be caught by observable subscribe function error handling.
    throw new TypeError('Provided object does not correctly implement Symbol.observable');
  });
}

/**
 * Synchronously emits the values of an array like and completes.
 * This is exported because there are creation functions and operators that need to
 * make direct use of the same logic, and there's no reason to make them run through
 * `from` conditionals because we *know* they're dealing with an array.
 * @param array The array to emit values from
 */
export function fromArrayLike<T>(array: ArrayLike<T>): Observable<T> {
  return new Observable((subscriber: Subscriber<T>) => {
    // Loop over the array and emit each value. Note two things here:
    // 1. We're making sure that the subscriber is not closed on each loop.
    //    This is so we don't continue looping over a very large array after
    //    something like a `take`, `takeWhile`, or other synchronous unsubscription
    //    has already unsubscribed.
    // 2. In this form, reentrant code can alter that array we're looping over.
    //    This is a known issue, but considered an edge case. The alternative would
    //    be to copy the array before executing the loop, but this has
    //    performance implications.
    for (let index = 0; index < array.length && !subscriber.closed; index++) {
      subscriber.next(array[index]);
    }
    subscriber.complete();
  });
}

export function fromPromise<T>(promise: PromiseLike<T>): Observable<T> {
  return new Observable((subscriber: Subscriber<T>) => {
    promise
      .then(
        (value) => {
          // The subscriber may have unsubscribed while the promise was
          // pending; in that case the resolved value is silently dropped.
          if (!subscriber.closed) {
            subscriber.next(value);
            subscriber.complete();
          }
        },
        (err: any) => subscriber.error(err)
      )
      // If the subscriber's error/complete handling itself throws, the error
      // would otherwise vanish inside this promise chain — report it
      // asynchronously as an unhandled error instead.
      .then(null, reportUnhandledError);
  });
}

export function fromIterable<T>(iterable: Iterable<T>): Observable<T> {
  return new Observable((subscriber: Subscriber<T>) => {
    for (const value of iterable) {
      subscriber.next(value);
      // A side-effect of `next` may have closed our subscriber — stop
      // iterating (exiting the for..of also runs the iterator's `return`)
      // without sending `complete`.
      if (subscriber.closed) {
        return;
      }
    }
    subscriber.complete();
  });
}

export function fromAsyncIterable<T>(asyncIterable: AsyncIterable<T>): Observable<T> {
  return new Observable((subscriber: Subscriber<T>) => {
    emitAsyncIterableValues(asyncIterable, subscriber).catch((err) => subscriber.error(err));
  });
}

export function fromReadableStreamLike<T>(readableStream: ReadableStreamLike<T>): Observable<T> {
  return fromAsyncIterable(readableStreamLikeToAsyncGenerator(readableStream));
}

/** Pulls every value out of the async iterable and pushes it at the subscriber. */
async function emitAsyncIterableValues<T>(asyncIterable: AsyncIterable<T>, subscriber: Subscriber<T>): Promise<void> {
  for await (const value of asyncIterable) {
    subscriber.next(value);
    // A side-effect may have closed our subscriber,
    // check before the next iteration.
    if (subscriber.closed) {
      return;
    }
  }
  subscriber.complete();
}
