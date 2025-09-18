export const lzwEncode = (indexed: Uint8Array, minCode: number): Uint8Array => {
  const CLEAR = 1 << minCode;
  const END = CLEAR + 1;
  let codeSize = minCode + 1;
  let dictSize = END + 1;
  const MAX = 4096;
  const out: number[] = [];
  let cur = 0;
  let curBits = 0;
  const push = (code: number) => {
    cur |= code << curBits;
    curBits += codeSize;
    while (curBits >= 8) {
      out.push(cur & 255);
      cur >>= 8;
      curBits -= 8;
    }
  };

  push(CLEAR);

  const resetDictionary = (map: Map<string, number>) => {
    map.clear();
    for (let i = 0; i < CLEAR; i++) {
      map.set(String(i), i);
    }
  };

  const map = new Map<string, number>();
  resetDictionary(map);

  let w = "";
  for (let i = 0; i < indexed.length; i++) {
    const k = indexed[i];
    const kStr = String(k);
    const wk = w ? `${w},${kStr}` : kStr;
    if (map.has(wk)) {
      w = wk;
    } else {
      const existing = map.get(w);
      if (existing === undefined) {
        throw new Error("Corrupted LZW dictionary state");
      }
      push(existing);
      if (dictSize < MAX) {
        map.set(wk, dictSize++);
        if (dictSize === 1 << codeSize && codeSize < 12) {
          codeSize++;
        }
      } else {
        push(CLEAR);
        resetDictionary(map);
        codeSize = minCode + 1;
        dictSize = END + 1;
      }
      w = kStr;
    }
  }

  if (w) {
    const existing = map.get(w);
    if (existing === undefined) {
      throw new Error("Corrupted LZW dictionary state");
    }
    push(existing);
  }

  push(END);
  if (curBits > 0) out.push(cur & 255);
  return new Uint8Array(out);
};
