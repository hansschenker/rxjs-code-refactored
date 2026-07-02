import { Subject, AnonymousSubject } from '../../../../upstream-rxjs/src/internal/Subject';
import { Subscriber } from '../../../../upstream-rxjs/src/internal/Subscriber';
import { Observable } from '../../../../upstream-rxjs/src/internal/Observable';
import { Subscription } from '../../../../upstream-rxjs/src/internal/Subscription';
import { Operator } from '../../../../upstream-rxjs/src/internal/Operator';
import { ReplaySubject } from '../../../../upstream-rxjs/src/internal/ReplaySubject';
import { Observer, NextObserver } from '../../../../upstream-rxjs/src/internal/types';

/**
 * WebSocketSubjectConfig is a plain Object that allows us to make our
 * webSocket configurable.
 *
 * <span class="informal">Provides flexibility to {@link webSocket}</span>
 *
 * It defines a set of properties to provide custom behavior in specific
 * moments of the socket's lifecycle. When the connection opens we can
 * use `openObserver`, when the connection is closed `closeObserver`, if we
 * are interested in listening for data coming from server: `deserializer`,
 * which allows us to customize the deserialization strategy of data before passing it
 * to the socket client. By default, `deserializer` is going to apply `JSON.parse` to each message coming
 * from the Server.
 *
 * ## Examples
 *
 * **deserializer**, the default for this property is `JSON.parse` but since there are just two options
 * for incoming data, either be text or binary data. We can apply a custom deserialization strategy
 * or just simply skip the default behaviour.
 *
 * ```ts
 * import { webSocket } from 'rxjs/webSocket';
 *
 * const wsSubject = webSocket({
 *   url: 'ws://localhost:8081',
 *   //Apply any transformation of your choice.
 *   deserializer: ({ data }) => data
 * });
 *
 * wsSubject.subscribe(console.log);
 *
 * // Let's suppose we have this on the Server: ws.send('This is a msg from the server')
 * //output
 * //
 * // This is a msg from the server
 * ```
 *
 * **serializer** allows us to apply custom serialization strategy but for the outgoing messages.
 *
 * ```ts
 * import { webSocket } from 'rxjs/webSocket';
 *
 * const wsSubject = webSocket({
 *   url: 'ws://localhost:8081',
 *   // Apply any transformation of your choice.
 *   serializer: msg => JSON.stringify({ channel: 'webDevelopment', msg: msg })
 * });
 *
 * wsSubject.subscribe(() => subject.next('msg to the server'));
 *
 * // Let's suppose we have this on the Server:
 * //   ws.on('message', msg => console.log);
 * //   ws.send('This is a msg from the server');
 * // output at server side:
 * //
 * // {"channel":"webDevelopment","msg":"msg to the server"}
 * ```
 *
 * **closeObserver** allows us to set a custom error when an error raises up.
 *
 * ```ts
 * import { webSocket } from 'rxjs/webSocket';
 *
 * const wsSubject = webSocket({
 *   url: 'ws://localhost:8081',
 *   closeObserver: {
 *     next() {
 *       const customError = { code: 6666, reason: 'Custom evil reason' }
 *       console.log(`code: ${ customError.code }, reason: ${ customError.reason }`);
 *     }
 *   }
 * });
 *
 * // output
 * // code: 6666, reason: Custom evil reason
 * ```
 *
 * **openObserver**, Let's say we need to make some kind of init task before sending/receiving msgs to the
 * webSocket or sending notification that the connection was successful, this is when
 * openObserver is useful for.
 *
 * ```ts
 * import { webSocket } from 'rxjs/webSocket';
 *
 * const wsSubject = webSocket({
 *   url: 'ws://localhost:8081',
 *   openObserver: {
 *     next: () => {
 *       console.log('Connection ok');
 *     }
 *   }
 * });
 *
 * // output
 * // Connection ok
 * ```
 */
export interface WebSocketSubjectConfig<T> {
  /** The url of the socket server to connect to */
  url: string;
  /** The protocol to use to connect */
  protocol?: string | Array<string>;
  /** @deprecated Will be removed in v8. Use {@link deserializer} instead. */
  resultSelector?: (e: MessageEvent) => T;
  /**
   * A serializer used to create messages from passed values before the
   * messages are sent to the server. Defaults to JSON.stringify.
   */
  serializer?: (value: T) => WebSocketMessage;
  /**
   * A deserializer used for messages arriving on the socket from the
   * server. Defaults to JSON.parse.
   */
  deserializer?: (e: MessageEvent) => T;
  /**
   * An Observer that watches when open events occur on the underlying web socket.
   */
  openObserver?: NextObserver<Event>;
  /**
   * An Observer that watches when close events occur on the underlying web socket
   */
  closeObserver?: NextObserver<CloseEvent>;
  /**
   * An Observer that watches when a close is about to occur due to
   * unsubscription.
   */
  closingObserver?: NextObserver<void>;
  /**
   * A WebSocket constructor to use. This is useful for situations like using a
   * WebSocket impl in Node (WebSocket is a DOM API), or for mocking a WebSocket
   * for testing purposes
   */
  WebSocketCtor?: { new (url: string, protocols?: string | string[]): WebSocket };
  /** Sets the `binaryType` property of the underlying WebSocket. */
  binaryType?: 'blob' | 'arraybuffer';
}

const DEFAULT_WEBSOCKET_CONFIG: WebSocketSubjectConfig<any> = {
  url: '',
  deserializer: (e: MessageEvent) => JSON.parse(e.data),
  serializer: (value: any) => JSON.stringify(value),
};

const WEBSOCKETSUBJECT_INVALID_ERROR_OBJECT =
  'WebSocketSubject.error must be called with an object with an error code, and an optional reason: { code: number, reason: string }';

export type WebSocketMessage = string | ArrayBuffer | Blob | ArrayBufferView;

/**
 * How this subject is wired (as an `AnonymousSubject`):
 *
 * - `this.destination` receives *outgoing* values (`next`/`error`/`complete`
 *   called on the subject). Before the socket opens it is a `ReplaySubject`
 *   that buffers outgoing messages; once the socket opens it is swapped for a
 *   `Subscriber` that writes directly to the socket.
 * - `this._output` is the *incoming* stream: messages deserialized from the
 *   socket are pushed to it, and every consumer subscription attaches to it.
 *
 * Only assigned via `lift` do `source`/custom `destination` come into play -
 * a lifted `WebSocketSubject` merely delegates subscription to its source.
 */
export class WebSocketSubject<T> extends AnonymousSubject<T> {
  // Assigned in the constructor unless this instance was created via `lift`
  // (in which case only `source`/`destination` are used).
  private _config!: WebSocketSubjectConfig<T>;

  /** @internal */
  _output!: Subject<T>;

  private _socket: WebSocket | null = null;

  constructor(urlConfigOrSource: string | WebSocketSubjectConfig<T> | Observable<T>, destination?: Observer<T>) {
    super();
    if (urlConfigOrSource instanceof Observable) {
      // Lifted instance: act as a plain AnonymousSubject over the given
      // source/destination. No socket state of its own.
      this.destination = destination;
      this.source = urlConfigOrSource as Observable<T>;
    } else {
      // Copy the defaults, then overlay the user's own properties on top.
      const config = (this._config = { ...DEFAULT_WEBSOCKET_CONFIG });
      this._output = new Subject<T>();
      if (typeof urlConfigOrSource === 'string') {
        config.url = urlConfigOrSource;
      } else {
        for (const key in urlConfigOrSource) {
          if (urlConfigOrSource.hasOwnProperty(key)) {
            (config as any)[key] = (urlConfigOrSource as any)[key];
          }
        }
      }

      // Fall back to the global WebSocket implementation. Note: this
      // deliberately *references* the global `WebSocket` binding - in
      // environments without one this line throws a ReferenceError, which is
      // the historical (and tested) behavior.
      if (!config.WebSocketCtor && WebSocket) {
        config.WebSocketCtor = WebSocket;
      } else if (!config.WebSocketCtor) {
        throw new Error('no WebSocket constructor can be found');
      }
      // Buffer outgoing messages until the socket actually opens.
      this.destination = new ReplaySubject();
    }
  }

  /** @deprecated Internal implementation detail, do not use directly. Will be made internal in v8. */
  lift<R>(operator: Operator<T, R>): WebSocketSubject<R> {
    const sock = new WebSocketSubject<R>(this._config as WebSocketSubjectConfig<any>, this.destination as any);
    sock.operator = operator;
    sock.source = this;
    return sock;
  }

  private _resetState() {
    this._socket = null;
    if (!this.source) {
      // Start buffering outgoing messages again for the next connection.
      this.destination = new ReplaySubject();
    }
    // Fresh output subject so future subscribers get a fresh stream.
    this._output = new Subject<T>();
  }

  /**
   * Creates an {@link Observable}, that when subscribed to, sends a message,
   * defined by the `subMsg` function, to the server over the socket to begin a
   * subscription to data over that socket. Once data arrives, the
   * `messageFilter` argument will be used to select the appropriate data for
   * the resulting Observable. When finalization occurs, either due to
   * unsubscription, completion, or error, a message defined by the `unsubMsg`
   * argument will be sent to the server over the WebSocketSubject.
   *
   * @param subMsg A function to generate the subscription message to be sent to
   * the server. This will still be processed by the serializer in the
   * WebSocketSubject's config. (Which defaults to JSON serialization)
   * @param unsubMsg A function to generate the unsubscription message to be
   * sent to the server at finalization. This will still be processed by the
   * serializer in the WebSocketSubject's config.
   * @param messageFilter A predicate for selecting the appropriate messages
   * from the server for the output stream.
   */
  multiplex(subMsg: () => any, unsubMsg: () => any, messageFilter: (value: T) => boolean) {
    const self = this;
    return new Observable((observer: Observer<T>) => {
      // Send the subscription message. Errors from `subMsg()` go to the
      // consumer, but note we still proceed to subscribe below - upstream
      // behavior that must be preserved.
      try {
        self.next(subMsg());
      } catch (err) {
        observer.error(err);
      }

      const subscription = self.subscribe({
        next: (x) => {
          try {
            if (messageFilter(x)) {
              observer.next(x);
            }
          } catch (err) {
            observer.error(err);
          }
        },
        error: (err) => observer.error(err),
        complete: () => observer.complete(),
      });

      return () => {
        // Send the unsubscription message *before* detaching from the socket
        // stream, so it still goes out over the shared connection.
        try {
          self.next(unsubMsg());
        } catch (err) {
          observer.error(err);
        }
        subscription.unsubscribe();
      };
    });
  }

  private _connectSocket() {
    const { WebSocketCtor, protocol, url, binaryType } = this._config;
    // Capture the output subject *now*: even if `_resetState()` later replaces
    // `this._output`, notifications from this socket must reach the consumers
    // that were attached when this connection was made.
    const observer = this._output;

    let socket: WebSocket | null = null;
    try {
      socket = protocol ? new WebSocketCtor!(url, protocol) : new WebSocketCtor!(url);
      this._socket = socket;
      if (binaryType) {
        this._socket.binaryType = binaryType;
      }
    } catch (e) {
      // Constructor failures surface as an error on the output stream.
      observer.error(e);
      return;
    }

    // Holds the queued-message replay subscription (added in `onopen`) and
    // closes the socket when torn down. Retained exactly as upstream has it;
    // the close-on-last-consumer logic actually lives in `_subscribe`.
    const subscription = new Subscription(() => {
      this._socket = null;
      if (socket && socket.readyState === 1) {
        socket.close();
      }
    });

    // NOTE: handler assignment order (onopen, onerror, onclose, onmessage)
    // is preserved from upstream.
    socket.onopen = (evt: Event) => {
      const { _socket } = this;
      if (!_socket) {
        // The subject was reset (e.g. unsubscribed) while connecting;
        // close the now-orphaned socket.
        socket!.close();
        this._resetState();
        return;
      }
      const { openObserver } = this._config;
      if (openObserver) {
        openObserver.next(evt);
      }

      // Swap the buffering ReplaySubject for a destination that writes
      // straight to the socket, then replay any queued messages into it.
      const queue = this.destination;

      this.destination = Subscriber.create<T>(
        (x) => {
          // Only send when the socket is OPEN (readyState 1).
          if (socket!.readyState === 1) {
            try {
              const { serializer } = this._config;
              socket!.send(serializer!(x!));
            } catch (e) {
              // Serialization errors are routed back into this destination's
              // error path (closing the socket with an invalid-error TypeError
              // unless a code is present).
              this.destination!.error(e);
            }
          }
        },
        (err) => {
          const { closingObserver } = this._config;
          if (closingObserver) {
            closingObserver.next(undefined);
          }
          if (err && err.code) {
            // Well-formed error: close the connection, telling the server why.
            socket!.close(err.code, err.reason);
          } else {
            // WebSocket requires a numeric close code; anything else is a
            // programming error surfaced on the output stream.
            observer.error(new TypeError(WEBSOCKETSUBJECT_INVALID_ERROR_OBJECT));
          }
          this._resetState();
        },
        () => {
          const { closingObserver } = this._config;
          if (closingObserver) {
            closingObserver.next(undefined);
          }
          socket!.close();
          this._resetState();
        }
      ) as Subscriber<any>;

      if (queue && queue instanceof ReplaySubject) {
        subscription.add((queue as ReplaySubject<T>).subscribe(this.destination));
      }
    };

    socket.onerror = (e: Event) => {
      this._resetState();
      observer.error(e);
    };

    socket.onclose = (e: CloseEvent) => {
      // Only reset if this is still the current socket - `onerror` or an
      // explicit teardown may already have reset and replaced the state.
      if (socket === this._socket) {
        this._resetState();
      }
      const { closeObserver } = this._config;
      if (closeObserver) {
        closeObserver.next(e);
      }
      if (e.wasClean) {
        observer.complete();
      } else {
        observer.error(e);
      }
    };

    socket.onmessage = (e: MessageEvent) => {
      try {
        const { deserializer } = this._config;
        observer.next(deserializer!(e));
      } catch (err) {
        // Deserializer errors error the output stream (they do not close
        // the socket here; the server connection stays as-is).
        observer.error(err);
      }
    };
  }

  /** @internal */
  protected _subscribe(subscriber: Subscriber<T>): Subscription {
    const { source } = this;
    if (source) {
      // Lifted instance: just delegate to the source.
      return source.subscribe(subscriber);
    }
    // First consumer triggers the actual connection; later consumers share it.
    if (!this._socket) {
      this._connectSocket();
    }
    this._output.subscribe(subscriber);
    subscriber.add(() => {
      const { _socket } = this;
      // When the last consumer leaves, close the socket if it is OPEN (1)
      // or CONNECTING (0), and reset for a possible future connection.
      if (this._output.observers.length === 0) {
        if (_socket && (_socket.readyState === 1 || _socket.readyState === 0)) {
          _socket.close();
        }
        this._resetState();
      }
    });
    return subscriber;
  }

  unsubscribe() {
    const { _socket } = this;
    if (_socket && (_socket.readyState === 1 || _socket.readyState === 0)) {
      _socket.close();
    }
    this._resetState();
    super.unsubscribe();
  }
}
