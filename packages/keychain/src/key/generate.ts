import { Name, NameLike } from "@ndn/packet";

import * as CertNaming from "../naming";
import type { KeyChain, KeyStore } from "../store/mod";
import { crypto } from "./crypto_node";
import { CryptoAlgorithm } from "./types";

export async function generateKeyInternal<Algo extends CryptoAlgorithm>(
    defaultAlgo: Algo, a: unknown[],
): Promise<[Name, Algo, CryptoAlgorithm.GeneratedKeyPair|CryptoAlgorithm.GeneratedSecretKey]> {
  let keyChain: KeyChain|undefined;
  if (typeof (a[0] as KeyChain).listKeys === "function") {
    keyChain = a.shift() as KeyChain;
  }
  const keyName = CertNaming.makeKeyName(new Name(a.shift() as NameLike));
  const algo = a.shift() as Algo ?? defaultAlgo;
  const genParams = a.shift() ?? {};

  const useJwk = keyChain ? keyChain.needJwk : false;
  const gen = await algo.cryptoGenerate(genParams, useJwk);

  if (keyChain) {
    const stored: KeyStore.StoredKey = {
      algo: algo.uuid,
      info: gen.info,
    };
    if ((gen as CryptoAlgorithm.GeneratedKeyPair<unknown>).privateKey) {
      await saveAsymmetric(stored, useJwk, gen as CryptoAlgorithm.GeneratedKeyPair<unknown>);
    } else {
      await saveSymmetric(stored, useJwk, gen as CryptoAlgorithm.GeneratedSecretKey<unknown>);
    }
    await keyChain.insertKey(keyName, stored);
  }

  return [keyName, algo, gen];
}

async function saveAsymmetric(
    stored: KeyStore.StoredKey,
    useJwk: boolean,
    gen: CryptoAlgorithm.GeneratedKeyPair<unknown>,
): Promise<void> {
  if (useJwk) {
    [stored.privateKey, stored.publicKey] = await Promise.all([
      crypto.subtle.exportKey("jwk", gen.privateKey),
      crypto.subtle.exportKey("jwk", gen.publicKey),
    ]);
    stored.jwkImportParams = gen.jwkImportParams;

    gen.privateKey = await crypto.subtle.importKey(
      "jwk", stored.privateKey, gen.jwkImportParams, false, ["sign"]);
  } else {
    stored.privateKey = gen.privateKey;
    stored.publicKey = gen.publicKey;
  }
  stored.publicKeySpki = gen.spki;
}

async function saveSymmetric(
    stored: KeyStore.StoredKey,
    useJwk: boolean,
    gen: CryptoAlgorithm.GeneratedSecretKey<unknown>,
): Promise<void> {
  if (useJwk) {
    stored.secretKey = await crypto.subtle.exportKey("jwk", gen.secretKey);
    stored.jwkImportParams = gen.jwkImportParams;

    gen.secretKey = await crypto.subtle.importKey(
      "jwk", stored.secretKey, gen.jwkImportParams, false, ["sign"]);
  } else {
    stored.secretKey = gen.secretKey;
  }
}
