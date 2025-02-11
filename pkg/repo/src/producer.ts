import { Endpoint, type Producer as EndpointProducer, type ProducerHandler } from "@ndn/endpoint";
import type { Data, Interest } from "@ndn/packet";
import type { Closer } from "@ndn/util";

import type { DataStore } from "./data-store";
import { type PrefixRegController, PrefixRegStrip } from "./prefix-reg/mod";

/** Make packets in {@link DataStore} available for retrieval. */
export class RepoProducer implements Disposable {
  public static create(store: DataStore, {
    endpoint = new Endpoint(),
    describe = "repo",
    fallback = async () => undefined,
    reg = PrefixRegStrip(PrefixRegStrip.stripNonGeneric),
  }: RepoProducer.Options = {}) {
    return new RepoProducer(store, endpoint, describe, fallback, reg);
  }

  private readonly prod: EndpointProducer;
  private readonly reg: Closer;

  private constructor(
      private readonly store: DataStore,
      endpoint: Endpoint,
      describe: string,
      private readonly fallback: RepoProducer.FallbackHandler,
      reg: PrefixRegController,
  ) {
    this.prod = endpoint.produce(undefined, this.processInterest, { describe });
    this.fallback = fallback;
    this.reg = reg(store, this.prod.face);
  }

  /**
   * Close the producer and prefix registration controller.
   * This does not close the DataStore.
   */
  public [Symbol.dispose](): void {
    this.reg.close();
    this.prod.close();
  }

  private readonly processInterest: ProducerHandler = async (interest) => {
    const found = await this.store.find(interest);
    return found ?? this.fallback(interest, this, this.store);
  };
}

export namespace RepoProducer {
  /** {@link RepoProducer.create} options. */
  export interface Options {
    /**
     * Endpoint for communication.
     * @defaultValue
     * Endpoint on default logical forwarder.
     */
    endpoint?: Endpoint;

    /**
     * Description for debugging purpose.
     * @defaultValue "repo"
     */
    describe?: string;

    /** Interest handler function for when Data is not found in repo. */
    fallback?: FallbackHandler;

    /**
     * Prefix registration controller.
     * @defaultValue
     * Register each Data prefix with non-generic components stripped.
     */
    reg?: PrefixRegController;
  }

  export type FallbackHandler = (interest: Interest, producer: RepoProducer, store: DataStore) => Promise<Data | undefined>;
}
