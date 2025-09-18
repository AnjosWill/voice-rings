import { lzwEncode } from "./lzw";

export interface GifWriterHandle {
  addFrameIndexed: (indexed: Uint8Array, delayCs?: number, transparentIndex?: number, dispose?: number) => void;
  addFrame: (
    rgba: Uint8ClampedArray,
    delayCs?: number,
    transparentIndex?: number,
    dispose?: number,
  ) => void;
  setNearest: (
    fn: (r: number, g: number, b: number, a: number, x: number, y: number) => number,
  ) => void;
  end: () => Uint8Array;
}

export const GifWriter = (width: number, height: number, palette: Uint8Array): GifWriterHandle => {
  const bytes: number[] = [];
  const w8 = (value: number) => {
    bytes.push(value & 255);
  };
  const w16 = (value: number) => {
    bytes.push(value & 255, (value >> 8) & 255);
  };
  const wArr = (arr: ArrayLike<number>) => {
    for (let i = 0; i < arr.length; i++) bytes.push(arr[i] & 255);
  };

  wArr([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
  w16(width);
  w16(height);
  w8(0xf7);
  w8(0x00);
  w8(0x00);
  wArr(palette);

  wArr([
    0x21, 0xff, 0x0b, 0x4e, 0x45, 0x54, 0x53, 0x43, 0x41, 0x50, 0x45, 0x32,
    0x2e, 0x30, 0x03, 0x01, 0x00, 0x00, 0x00,
  ]);

  const writeImage = (
    indexed: Uint8Array,
    delayCs = 4,
    transparentIndex = 0,
    dispose = 2,
  ) => {
    wArr([0x21, 0xf9, 0x04]);
    w8(((dispose & 7) << 2) | 0x01);
    w16(delayCs);
    w8(transparentIndex);
    w8(0);
    w8(0x2c);
    w16(0);
    w16(0);
    w16(width);
    w16(height);
    w8(0x00);
    const minCode = 8;
    w8(minCode);
    const lzw = lzwEncode(indexed, minCode);
    for (let offset = 0; offset < lzw.length; ) {
      const size = Math.min(255, lzw.length - offset);
      w8(size);
      wArr(lzw.subarray(offset, offset + size));
      offset += size;
    }
    w8(0x00);
  };

  let nearest = () => 0;

  return {
    addFrameIndexed: (
      indexed: Uint8Array,
      delayCs = 4,
      transparentIndex = 0,
      dispose = 2,
    ) => {
      writeImage(indexed, delayCs, transparentIndex, dispose);
    },
    addFrame: (
      rgba: Uint8ClampedArray,
      delayCs = 4,
      transparentIndex = 0,
      dispose = 2,
    ) => {
      const indexed = new Uint8Array(width * height);
      for (let y = 0, p = 0, idx = 0; y < height; y++) {
        for (let x = 0; x < width; x++, p += 4, idx++) {
          indexed[idx] = nearest(rgba[p], rgba[p + 1], rgba[p + 2], rgba[p + 3], x, y);
        }
      }
      writeImage(indexed, delayCs, transparentIndex, dispose);
    },
    setNearest: (fn) => {
      nearest = fn;
    },
    end: () => {
      w8(0x3b);
      return new Uint8Array(bytes);
    },
  };
};

