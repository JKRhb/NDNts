import { Name } from "@ndn/packet";
import { retrieveMetadata } from "@ndn/rdr";
import { discoverVersion, fetch } from "@ndn/segmented-object";
import stdout from "stdout-stream";
import type { Arguments, Argv, CommandModule } from "yargs";

import { checkVersionArg, CommonArgs, Segment, Version } from "./util";

interface Args extends CommonArgs {
  name: string;
  ver: string;
}

async function main(args: Args) {
  let name = new Name(args.name);
  switch (args.ver) {
    case "none":
      break;
    case "cbp":
      name = await discoverVersion(name, {
        segmentNumConvention: Segment,
        versionConvention: Version,
      });
      break;
    case "rdr":
      name = (await retrieveMetadata(name)).name;
      break;
    default:
      name = name.append(Version, Number.parseInt(args.ver, 10));
      break;
  }

  await fetch(name, { segmentNumConvention: Segment }).pipe(stdout);
}

export class GetSegmentedCommand implements CommandModule<CommonArgs, Args> {
  public command = "get-segmented <name>";
  public describe = "retrieve segmented object";
  public aliases = ["get"];

  public builder(argv: Argv<CommonArgs>): Argv<Args> {
    return argv
      .positional("name", {
        demandOption: true,
        desc: "name prefix",
        type: "string",
      })
      .option("ver", {
        default: "rdr",
        desc: ["version number or discovery method",
          "none: no version component",
          "cbp: send Interest with CanBePrefix",
          "rdr: use RDR protocol"].join("\n"),
        type: "string",
      })
      .check(checkVersionArg(["none", "cbp", "rdr"]));
  }

  public async handler(args: Arguments<Args>) {
    await main(args);
  }
}
