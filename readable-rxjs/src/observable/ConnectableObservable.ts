import { Subject } from '../../../upstream-rxjs/src/internal/Subject';
import { Observable } from '../../../upstream-rxjs/src/internal/Observable';
import { Subscriber } from '../../../upstream-rxjs/src/internal/Subscriber';
import { Subscription } from '../../../upstream-rxjs/src/internal/Subscription';
import { refCount as higherOrderRefCount } from '../operators/refCount';
import { createOperatorSubscriber } from '../operators/OperatorSubscriber';
import { hasLift } from '../../../upstream-rxjs/src/internal/util/lift';

/**
 * @class ConnectableObservable<T>
 * @deprecated Will be removed in v8. Use {@link connectable} to create a connectable observable.
 * If you are using the `refCount` method of `ConnectableObservable`, use the {@link share} operator
 * instead.
 * Details: https://rxjs.dev/deprecations/multicasting
 */
export class ConnectableObservable<T> extends Observable<T> {
  /**
   * The subject currently multicasting source values to consumers.
   * `null` while the observable is "cold" (never connected, or reset by teardown).
   */
  protected _subject: Subject<T> | null = null;

  /**
   * The number of consumers currently subscribed via the {@link refCount} operator.
   * Read and written by `refCount` (through `(source as any)._refCount`), and reset
   * here whenever the connection tears down.
   */
  protected _refCount: number = 0;

  /**
   * The subscription representing the active connection to the source.
   * `null` while disconnected.
   */
  protected _connection: Subscription | null = null;

  /**
   * @param source The source observable
   * @param subjectFactory The factory that creates the subject used internally.
   * @deprecated Will be removed in v8. Use {@link connectable} to create a connectable observable.
   * `new ConnectableObservable(source, factory)` is equivalent to
   * `connectable(source, { connector: factory })`.
   * When the `refCount()` method is needed, the {@link share} operator should be used instead:
   * `new ConnectableObservable(source, factory).refCount()` is equivalent to
   * `source.pipe(share({ connector: factory }))`.
   * Details: https://rxjs.dev/deprecations/multicasting
   */
  constructor(public source: Observable<T>, protected subjectFactory: () => Subject<T>) {
    super();
    // If we have lift, monkey patch that here. This is done so custom observable
    // types will compose through multicast. Otherwise the resulting observable would
    // simply be an instance of `ConnectableObservable`.
    if (hasLift(source)) {
      this.lift = source.lift;
    }
  }

  /** @internal */
  protected _subscribe(subscriber: Subscriber<T>): Subscription {
    // Consumers never subscribe to the source directly; they subscribe to the
    // multicasting subject. The source is only subscribed via `connect()`.
    return this.getSubject().subscribe(subscriber);
  }

  protected getSubject(): Subject<T> {
    const subject = this._subject;
    // A stopped subject (errored or completed) can no longer multicast, so a
    // fresh one is created lazily for any new consumers.
    if (!subject || subject.isStopped) {
      this._subject = this.subjectFactory();
    }
    return this._subject!;
  }

  protected _teardown(): void {
    this._refCount = 0;
    // Capture the connection, then null out state BEFORE unsubscribing it.
    // This ordering matters: unsubscribing the connection can reentrantly
    // trigger teardown paths, which must observe the already-reset state.
    const { _connection } = this;
    this._subject = this._connection = null;
    _connection?.unsubscribe();
  }

  /**
   * @deprecated {@link ConnectableObservable} will be removed in v8. Use {@link connectable} instead.
   * Details: https://rxjs.dev/deprecations/multicasting
   */
  connect(): Subscription {
    let connection = this._connection;
    if (!connection) {
      // Idempotent: only connect if there is no active connection.
      // `this._connection` must be assigned before subscribing to the source,
      // because a synchronous source can complete (and tear down) reentrantly.
      connection = this._connection = new Subscription();
      const subject = this.getSubject();
      connection.add(
        this.source.subscribe(
          createOperatorSubscriber(
            subject as any,
            undefined,
            () => {
              // Reset connection state first, THEN notify consumers, so that
              // resubscriptions from complete handlers see a "cold" observable.
              this._teardown();
              subject.complete();
            },
            (err) => {
              // Same ordering as completion: reset before notifying.
              this._teardown();
              subject.error(err);
            },
            () => this._teardown()
          )
        )
      );

      // If the source completed or errored synchronously during subscribe,
      // teardown already ran and cleared `this._connection`. Hand back a
      // closed subscription rather than the stale one.
      if (connection.closed) {
        this._connection = null;
        connection = Subscription.EMPTY;
      }
    }
    return connection;
  }

  /**
   * @deprecated {@link ConnectableObservable} will be removed in v8. Use the {@link share} operator instead.
   * Details: https://rxjs.dev/deprecations/multicasting
   */
  refCount(): Observable<T> {
    return higherOrderRefCount()(this) as Observable<T>;
  }
}
