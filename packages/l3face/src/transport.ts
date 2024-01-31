import type { Decoder } from "@ndn/tlv";

const DEFAULT_MTU = 1200;

/**
 * Low-level transport.
 *
 * @remarks
 * The transport understands NDN TLV structures, but does not otherwise concern with packet format.
 */
export abstract class Transport {
  public abstract readonly rx: Transport.Rx;
  public abstract readonly tx: Transport.Tx;

  protected constructor(public readonly attributes: Transport.Attributes) {}

  /**
   * Return the transport MTU, if known.
   *
   * @remarks
   * The transport should be able to send TLV structure of up to this size.
   */
  public get mtu() { return DEFAULT_MTU; }

  /**
   * Reopen the transport after it has failed.
   * @returns The same transport or a new transport after it has been reconnected.
   *
   * @throws {@link Transport.ReopenNotSupportedError}
   * Thrown to indicate the transport does not support reopening.
   */
  public reopen(): Promise<Transport> {
    return Promise.reject(new Transport.ReopenNotSupportedError());
  }

  public toString() {
    /* c8 ignore next */
    return this.attributes.describe ?? this.constructor.name;
  }
}

export namespace Transport {
  export interface Attributes extends Record<string, unknown> {
    /**
     * Textual description.
     * @defaultValue Automatically generated from constructor name.
     */
    describe?: string;

    /**
     * Whether the transport connects to a destination on the local machine.
     * @defaultValue `false`
     */
    local?: boolean;

    /**
     * Whether the transport can possibly talk to multiple peers.
     * @defaultValue `false`
     */
    multicast?: boolean;
  }

  /** RX iterable for incoming packets. */
  export type Rx = AsyncIterable<Decoder.Tlv>;

  /**
   * TX function for outgoing packets.
   * @returns Promise that resolves when iterable is exhausted, and rejects upon error.
   */
  export type Tx = (iterable: AsyncIterable<Uint8Array>) => Promise<void>;

  /**
   * Error thrown by {@link Transport.reopen} to indicate that reopen operation is not supported.
   * No further `.reopen()` should be attempted.
   */
  export class ReopenNotSupportedError extends Error {
    constructor() {
      super("reopen not supported");
    }
  }
}
