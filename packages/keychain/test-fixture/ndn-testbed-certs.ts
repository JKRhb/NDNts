import { toByteArray } from "base64-js";

function fromBase64(s: string): Uint8Array {
  return toByteArray(s.replace(/\s/g, ""));
}

export const ROOT_V2_NDNCERT = fromBase64(`
  Bv0COwckCANuZG4IA0tFWQgIZZ1/pcWBEH0IA25kbggJ/QAAAWBxSlGbFAkYAQIZ
  BAA27oAV/QFPMIIBSzCCAQMGByqGSM49AgEwgfcCAQEwLAYHKoZIzj0BAQIhAP//
  //8AAAABAAAAAAAAAAAAAAAA////////////////MFsEIP////8AAAABAAAAAAAA
  AAAAAAAA///////////////8BCBaxjXYqjqT57PrvVV2mIa8ZR0GsMxTsPY7zjw+
  J9JgSwMVAMSdNgiG5wSTamZ44ROdJreBn36QBEEEaxfR8uEsQkf4vOblY6RA8ncD
  fYEt6zOg9KE5RdiYwpZP40Li/hp/m47n60p8D54WK84zV2sxXs7LtkBoN79R9QIh
  AP////8AAAAA//////////+85vqtpxeehPO5ysL8YyVRAgEBA0IABAUIdqatSfln
  i6u9XO2ZSmBA+MjDwkx2RiPtCCLsm4oKVn2Jyfa/yOSgZseGqnTEdbN1rDWvlIgA
  mxI0MUXVM1gWbRsBAxwWBxQIA25kbggDS0VZCAhlnX+lxYEQff0A/Sb9AP4PMjAx
  NzEyMjBUMDAxOTM5/QD/DzIwMjAxMjMxVDIzNTk1Of0BAiT9AgAg/QIBCGZ1bGxu
  YW1l/QICEE5ETiBUZXN0YmVkIFJvb3QXRjBEAiAwtzbOA+F6xiLB7iYBzSpWpZzf
  mtWqsXljm/SkXu4rPQIgTFMi3zZm/Eh+X0tzrcOxDhbmsl2chkIjyookaM9pukM=`);

export const ROOT_V2_SPKI = fromBase64(`
  MIIBSzCCAQMGByqGSM49AgEwgfcCAQEwLAYHKoZIzj0BAQIhAP////8AAAABAAAA
  AAAAAAAAAAAA////////////////MFsEIP////8AAAABAAAAAAAAAAAAAAAA////
  ///////////8BCBaxjXYqjqT57PrvVV2mIa8ZR0GsMxTsPY7zjw+J9JgSwMVAMSd
  NgiG5wSTamZ44ROdJreBn36QBEEEaxfR8uEsQkf4vOblY6RA8ncDfYEt6zOg9KE5
  RdiYwpZP40Li/hp/m47n60p8D54WK84zV2sxXs7LtkBoN79R9QIhAP////8AAAAA
  //////////+85vqtpxeehPO5ysL8YyVRAgEBA0IABAUIdqatSflni6u9XO2ZSmBA
  +MjDwkx2RiPtCCLsm4oKVn2Jyfa/yOSgZseGqnTEdbN1rDWvlIgAmxI0MUXVM1g=`);

export const ARIZONA_20190312 = fromBase64(`
  Bv0CxQcxCANuZG4IA2VkdQgHYXJpem9uYQgDS0VZCAiorqTUoPxZxQgCTkEICf0A
  AAFpeFZoshQJGAECGQQANu6AFf0BJjCCASIwDQYJKoZIhvcNAQEBBQADggEPADCC
  AQoCggEBAOkJgI/V5Qhoz/5IK3ifMwu6iuLy22DdjX7U3b1KBf9C1HiD+lGTdrsB
  gTPTGbbxY9y9s5ZxHoE6lwRmV82Z09W5Ox7AlJy7Pl+cmEVSx+ozxkmaxzUySu6h
  rq2DVqL8zqjpL0MH7JOh98k0o7y9LJ2oprWAqQYLyGir2Hu5CxJ+YnQUa/o0PSgP
  fbfWXuLObm6u28FM/9cbTp7bzp2rDV9vsIrS2bdTkwAmp8kWMAvms2iEkLKo9Akf
  Z0fl7vpf3OKX3RdVYM6XZw+UrI1bB42/x6VQea7yXgTXL4+Z5R5hCHSjGJdUI1Qb
  i61sAZgId62uywyydPAqxjQ7H8fQZCUCAwEAARb9ARAbAQMcFgcUCANuZG4IA0tF
  WQgIZZ1/pcWBEH39AP0m/QD+DzIwMTkwMzEyVDE4MzUyMv0A/w8yMDIwMDMxMlQx
  ODM1MjL9AQLH/QIAD/0CAQdhZHZpc29y/QICAP0CADf9AgEFZW1haWz9AgIqL25k
  bi9lZHUvYXJpem9uYS9Ab3BlcmF0b3JzLm5hbWVkLWRhdGEubmV0/QIAKf0CAQhm
  dWxsbmFtZf0CAhlUaGUgVW5pdmVyc2l0eSBvZiBBcml6b25h/QIADf0CAQVncm91
  cP0CAgD9AgAP/QIBB2hvbWV1cmz9AgIA/QIAJP0CAQxvcmdhbml6YXRpb279AgIQ
  TkROIFRlc3RiZWQgUm9vdBdHMEUCIQD6lFxw9W7wso9iBSfg0Mqxa2Q6ayqsrV4P
  ernaiaSKyAIgf2zQNwWShPIY1uPbtKOPjnoyCT33HUTnTnm+ejmAQng=`);
