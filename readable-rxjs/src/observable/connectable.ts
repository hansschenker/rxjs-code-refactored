import { Connectable, ObservableInput, SubjectLike } from '../../../upstream-rxjs/src/internal/types';
import { Subject } from '../../../upstream-rxjs/src/internal/Subject';
import { Subscription } from '../../../upstream-rxjs/src/internal/Subscription';
import { Observable } from '../../../upstream-rxjs/src/internal/Observable';
import { defer } from './defer';

export interface ConnectableConfig<T> {
  /**
   * A factory function used to create the Subject through which the source
   * is multicast. By default this creates a {@link Subject}.
   */
  connector: () => SubjectLike<T>;
  /**
   * If true, the resulting observable will reset internal state upon disconnection
   * and return to a "cold" state. This allows the resulting observable to be
   * reconnected.
   * If false, upon disconnection, the connecting subject will remain the
   * connecting subject, meaning the resulting observable will not go "cold" again,
   * and subsequent repeats or resubscriptions will resubscribe to that same subject.
   */
  resetOnDisconnect?: boolean;
}

/**
 * The default configuration for `connectable`.
 */
const DEFAULT_CONFIG: ConnectableConfig<unknown> = {
  connector: () => new Subject<unknown>(),
  resetOnDisconnect: true,
};

/**
 * Creates an observable that multicasts once `connect()` is called on it.
 *
 * @param source The observable source to make connectable.
 * @param config The configuration object for `connectable`.
 * @returns A "connectable" observable, that has a `connect()` method, that you must call to
 * connect the source to all consumers through the subject provided as the connector.
 */
export function connectable<T>(source: ObservableInput<T>, config: ConnectableConfig<T> = DEFAULT_CONFIG): Connectable<T> {
  // The subscription representing the current connection to the source.
  // `null` (or closed) means the source is disconnected.
  let connection: Subscription | null = null;
  const { connector, resetOnDisconnect = true } = config;
  // The multicasting subject is created eagerly, so consumers that subscribe
  // before `connect()` is called are already wired up to receive values.
  let subject = connector();

  // Consumers subscribe to the subject only; the source is subscribed
  // separately, by calling `connect()` below.
  const result = new Observable<T>((subscriber) => {
    return subject.subscribe(subscriber);
  }) as Connectable<T>;

  // Define the `connect` function. This is what users must call
  // in order to "connect" the source to the subject that is
  // multicasting it.
  result.connect = () => {
    // Idempotent while connected: only (re)connect if there is no
    // active connection.
    if (!connection || connection.closed) {
      // `defer` postpones converting `source` (an ObservableInput) until the
      // moment of connection, so conversion errors surface at connect time.
      connection = defer(() => source).subscribe(subject);
      if (resetOnDisconnect) {
        // On disconnection, swap in a fresh subject so the observable
        // returns to a "cold", reconnectable state.
        connection.add(() => (subject = connector()));
      }
    }
    return connection;
  };

  return result;
}
