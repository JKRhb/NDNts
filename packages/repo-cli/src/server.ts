import { exitClosers, getSigner, openUplinks } from "@ndn/cli-common";
import type { DataStore } from "@ndn/repo";
import { BulkInsertTarget, RepoProducer, respondRdr } from "@ndn/repo";
import { createServer } from "node:net";
import type { Arguments, Argv, CommandModule } from "yargs";

import { type StoreArgs, declareStoreArgs, openStore } from "./util";

interface Args extends StoreArgs {
  rdr: boolean;
  bi: boolean;
  "bi-host": string;
  "bi-port": number;
  "bi-batch": number;
  "bi-parallel": number;
}

function enableBulkInsertion(store: DataStore, {
  "bi-host": host,
  "bi-port": port,
  "bi-batch": batch,
  "bi-parallel": parallel,
}: Args) {
  const bi = BulkInsertTarget.create(store, { batch, parallel });
  const server = createServer((sock) => {
    void bi.accept(sock);
  }).listen(port, host);
  exitClosers.push(server);
}

export class ServerCommand implements CommandModule<{}, Args> {
  public command = "server";
  public describe = "run repo server";

  public builder(argv: Argv): Argv<Args> {
    return declareStoreArgs(argv)
      .option("rdr", {
        default: false,
        desc: "respond to RDR discovery Interests",
        type: "boolean",
      })
      .option("bi", {
        default: true,
        desc: "enable bulk insertion",
        type: "boolean",
      })
      .option("bi-host", {
        default: "127.0.0.1",
        desc: "bulk insertion listen host",
        type: "string",
      })
      .option("bi-port", {
        default: 7376,
        desc: "bulk insertion listen port",
        type: "number",
      })
      .option("bi-batch", {
        default: 64,
        desc: "bulk insertion packets per batch",
        type: "number",
      })
      .option("bi-parallel", {
        default: 1,
        desc: "bulk insertion maximum parallel batches",
        type: "number",
      });
  }

  public async handler(args: Arguments<Args>) {
    await openUplinks();
    const store = openStore(args);
    const producer = RepoProducer.create(store, {
      fallback: args.rdr ? respondRdr({ signer: await getSigner() }) : undefined,
    });
    exitClosers.push(producer);

    if (args.bi) {
      enableBulkInsertion(store, args);
    }
    await new Promise(() => undefined);
  }
}
