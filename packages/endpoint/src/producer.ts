import { Forwarder, FwFace, FwPacket } from "@ndn/fw";
import { Data, Interest, Name, NameLike, Signer, SigType } from "@ndn/packet";
import { flatTransform } from "streaming-iterables";

import type { DataBuffer } from "./data-buffer";

/**
 * Producer handler function.
 *
 * The handler can return a Data to respond to the Interest, or return 'false' to cause a timeout.
 *
 * If Options.dataBuffer is provided, the handler can access the DataBuffer via producer.dataBuffer .
 * The handler can return a Data to respond to the Interest, which is also inserted to the DataBuffer
 * unless Options.autoBuffer is set to false. If the handler returns 'false', the Interest is used
 * to query the DataBuffer, and any matching Data may be sent.
 */
export type Handler = (interest: Interest, producer: Producer) => Promise<Data|false>;

export interface Options {
  /**
   * What name to be readvertised.
   * Ignored if prefix is undefined.
   */
  announcement?: EndpointProducer.RouteAnnouncement;

  /**
   * How many Interests to process in parallel.
   * Default is 1.
   */
  concurrency?: number;

  /** Description for debugging purpose. */
  describe?: string;

  /**
   * If specified, automatically sign Data packets unless already signed.
   * This does not apply to Data packets manually inserted to the dataBuffer.
   */
  dataSigner?: Signer;

  /** Outgoing Data buffer. */
  dataBuffer?: DataBuffer;

  /**
   * Whether to add handler return value to buffer.
   * Default is true.
   * Ignored when dataBuffer is not specified.
   */
  autoBuffer?: boolean;
}

/** A running producer. */
export interface Producer {
  readonly prefix: Name|undefined;

  readonly face: FwFace;

  readonly dataBuffer?: DataBuffer;

  /** Close the producer. */
  close: () => void;
}

/** Producer functionality of Endpoint. */
export class EndpointProducer {
  declare public fw: Forwarder;
  declare public opts: Options;

  /**
   * Start a producer.
   * @param prefixInput prefix registration; if undefined, prefixes may be added later.
   * @param handler function to handle incoming Interest.
   */
  public produce(prefixInput: NameLike|undefined, handler: Handler, opts: Options = {}): Producer {
    const prefix = typeof prefixInput === "undefined" ? undefined : new Name(prefixInput);
    const {
      announcement,
      concurrency = 1,
      describe = `produce(${prefix})`,
      dataSigner,
      dataBuffer,
      autoBuffer = true,
    } = { ...this.opts, ...opts };
    let producer: Producer; // eslint-disable-line prefer-const

    const processInterestUnbuffered = async (interest: Interest) => {
      const data = await handler(interest, producer);
      if (!(data instanceof Data)) {
        return undefined;
      }

      await signUnsignedData(data, dataSigner);
      if (!await data.canSatisfy(interest)) {
        return undefined;
      }
      return data;
    };

    let processInterest = processInterestUnbuffered;
    if (dataBuffer) {
      processInterest = async (interest: Interest) => {
        let found = await dataBuffer.find(interest);
        if (!found) {
          const output = await processInterestUnbuffered(interest);
          if (output) {
            if (autoBuffer) { await dataBuffer.insert(output); }
            return output;
          }
          found = await dataBuffer.find(interest);
        }
        return found;
      };
    }

    const face = this.fw.addFace({
      transform: flatTransform(concurrency, async function*({ l3: interest, token }: FwPacket) {
        if (!(interest instanceof Interest)) {
          return;
        }
        const data = await processInterest(interest).catch(() => undefined);
        if (!data) {
          return;
        }
        yield FwPacket.create(data, token);
      }),
    },
    {
      describe,
      local: true,
    });
    if (prefix) {
      face.addRoute(prefix, announcement);
    }

    producer = {
      prefix,
      face,
      dataBuffer,
      close() { face.close(); },
    };
    return producer;
  }
}

export namespace EndpointProducer {
  export type RouteAnnouncement = FwFace.RouteAnnouncement;
}

export async function signUnsignedData(data: Data, dataSigner: Signer|undefined) {
  if (dataSigner && data.sigInfo.type === SigType.Null) {
    await dataSigner.sign(data);
  }
}
