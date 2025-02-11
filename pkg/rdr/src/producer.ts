import { Endpoint, type Producer } from "@ndn/endpoint";
import { Segment, Version } from "@ndn/naming-convention2";
import { Data, type Interest, Name, type NameLike, noopSigning, type Signer } from "@ndn/packet";
import { Encoder } from "@ndn/tlv";

import { type Metadata, MetadataKeyword } from "./metadata";

function makeName({ name }: Metadata, prefix?: NameLike): Name {
  prefix = prefix ? Name.from(prefix) : name.getPrefix(-1);
  return prefix.append(MetadataKeyword, Version.create(Date.now()), Segment.create(0));
}

/** Make metadata packet. */
export async function makeMetadataPacket(m: Metadata, {
  prefix,
  freshnessPeriod = 1,
  signer = noopSigning,
}: makeMetadataPacket.Options = {}): Promise<Data> {
  const data = new Data();
  data.name = makeName(m, prefix);
  data.content = Encoder.encode(m);
  data.freshnessPeriod = freshnessPeriod;
  await signer.sign(data);
  return data;
}

export namespace makeMetadataPacket {
  export interface Options {
    /**
     * Metadata packet prefix.
     * @defaultValue `metadata.name.getPrefix(-1)`
     *
     * This should not contain `32=metadata` component.
     */
    prefix?: NameLike;

    /**
     * FreshnessPeriod.
     * @defaultValue 1
     */
    freshnessPeriod?: number;

    /**
     * Data signer.
     * @defaultValue noopSigning
     */
    signer?: Signer;
  }
}

/** Determine if an Interest is a discovery Interest. */
export function isDiscoveryInterest({ name, canBePrefix, mustBeFresh }: Interest): boolean {
  return !!name.get(-1)?.equals(MetadataKeyword) && canBePrefix && mustBeFresh;
}

/** Serve metadata packet in a producer. */
export function serveMetadata(m: Metadata | (() => Metadata), opts: serveMetadata.Options = {}): Producer {
  const {
    prefix: prefixInput,
    endpoint = new Endpoint(),
    announcement,
  } = opts;
  const makeMetadata = typeof m === "function" ? m : () => m;
  const prefix = makeName(makeMetadata(), prefixInput).getPrefix(-2);

  return endpoint.produce(prefix,
    async (interest) => {
      if (isDiscoveryInterest(interest) && interest.name.length === prefix.length) {
        return makeMetadataPacket(makeMetadata(), opts);
      }
      return undefined;
    },
    {
      describe: `RDR-s(${prefix})`,
      announcement,
    });
}
export namespace serveMetadata {
  export interface Options extends makeMetadataPacket.Options {
    /**
     * Endpoint for communication.
     * @defaultValue
     * Endpoint on default logical forwarder.
     */
    endpoint?: Endpoint;

    /** Prefix to announce from producer. */
    announcement?: Endpoint.RouteAnnouncement;
  }
}

