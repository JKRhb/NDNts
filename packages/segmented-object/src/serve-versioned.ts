import { Component, type ComponentLike, Name, type NameLike } from "@ndn/packet";

import { defaultVersionConvention, type VersionConventionFromNumber } from "./convention";
import { type ChunkSource, serve, type ServeOptions, type Server } from "./serve/mod";

type GivenVersionOptions = {
  /** Version number component. */
  version: ComponentLike;
};

type MakeVersionOptions = {
  /**
   * Choose a version number naming convention.
   * Default is Version from @ndn/naming-convention2 package.
   */
  versionConvention?: VersionConventionFromNumber;

  /** Version number. */
  version?: number;
};

/** Options to serveVersioned(). */
export type ServeVersionedOptions = ServeOptions & (GivenVersionOptions | MakeVersionOptions);

export function serveVersioned(prefixInput: NameLike, source: ChunkSource,
    opts: ServeVersionedOptions = {}): Server {
  let versionComp: Component;
  let { version = Date.now(), producerPrefix } = opts;
  if (typeof version === "number") {
    const { versionConvention = defaultVersionConvention } = opts as MakeVersionOptions;
    versionComp = versionConvention.create(version);
  } else {
    versionComp = Component.from(version);
  }

  const prefix = Name.from(prefixInput);
  producerPrefix ??= prefix;
  return serve(prefix.append(versionComp), source, {
    ...opts,
    producerPrefix,
  });
}
