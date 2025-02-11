import { Endpoint } from "@ndn/endpoint";
import { Bridge } from "@ndn/l3face";
import { type Data, Name } from "@ndn/packet";
import { Closers, delay } from "@ndn/util";
import { collect, map } from "streaming-iterables";
import { afterEach, expect, test } from "vitest";

import { PrpsPublisher, PrpsSubscriber } from "..";

afterEach(Endpoint.deleteDefaultForwarder);

test("simple", async () => {
  const star = Bridge.star({
    leaves: 3,
    relayBA: { delay: 10, jitter: 0.1 },
  });

  const sub0 = new PrpsSubscriber({
    endpoint: new Endpoint({ fw: star[0]!.fwB }),
    msgInterestLifetime: 200,
  });
  const sub1 = new PrpsSubscriber({
    endpoint: new Endpoint({ fw: star[1]!.fwB }),
    msgInterestLifetime: 200,
  });
  using pub = new PrpsPublisher({
    endpoint: new Endpoint({ fw: star[2]!.fwB, retx: 1 }),
    notifyInterestLifetime: 1000,
  });

  const topicA = new Name("/prps-demo/A");
  const topicB = new Name("/prps-demo/B");
  const topicC = new Name("/prps-demo/C");
  const pubTopicMap: Record<number, Name> = { 0: topicA, 1: topicA, 2: topicB, 3: topicB, 4: topicC };
  const pubPromises: Array<Promise<void>> = [];
  const pubExpectedResults: Array<PromiseSettledResult<void>["status"]> = [];
  for (let i = 0; i < 100; ++i) {
    const rem = i % 5;
    pubPromises.push(pub.publish(pubTopicMap[rem]!, Uint8Array.of(0xDD, i)));
    pubExpectedResults.push(rem === 4 ? "rejected" : "fulfilled");
  }

  const sub0A = sub0.subscribe(topicA);
  const sub0B = sub0.subscribe(topicB);
  const sub1A = sub1.subscribe(topicA);
  const mapDataIndex = map((data: Data): number => {
    expect(data.content).toHaveLength(2);
    expect(data.content[0]).toBe(0xDD);
    return data.content[1]!;
  });
  const [
    data0A,
    data0B,
    data1A,
    pubResults,
  ] = await Promise.all([
    collect(mapDataIndex(sub0A)),
    collect(mapDataIndex(sub0B)),
    collect(mapDataIndex(sub1A)),
    Promise.allSettled(pubPromises),
    (async () => {
      using closers = new Closers(sub0A, sub0B, sub1A);
      await delay(3000);
    })(),
  ]);

  expect(data0A.length).toBeLessThanOrEqual(40);
  expect(data1A.length).toBeLessThanOrEqual(40);
  expect(data0A.length + data1A.length).toBeGreaterThanOrEqual(40);
  expect(data0B.length).toBeGreaterThanOrEqual(40);
  expect(data0B.length).toBeLessThan(60);
  expect(pubResults.map(({ status }) => status)).toEqual(pubExpectedResults);
});
