// adapted from https://gist.github.com/Juszczak/63e6d9e01decc850de03
/**
 * base64 encoding/decoding
 */
export namespace base64 {
  const PADCHAR: string = '='
  const ALPHA: string =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

  /**
   * Decode base64-encoded string and return a Uint8Array.
   * @param s Base64 encoded string.
   */
  export function decode(s: string): Uint8Array {
    let i: u32, b10: u32
    let pads = 0,
      imax = s.length as u32

    if (imax == 0) {
      return new Uint8Array(0)
    }

    if (s.charAt(imax - 1) == PADCHAR) {
      pads = 1
      if (s.charAt(imax - 2) == PADCHAR) {
        pads = 2
      }
      imax -= 4
    }

    let main_chunk = imax % 4 == 0 ? (imax / 4) * 3 : (imax / 4 + 1) * 3
    let pad_size = pads > 0 ? 3 - pads : 0
    let size = main_chunk + pad_size

    let x = new Uint8Array(size),
      index = 0

    for (i = 0; i < imax; i += 4) {
      b10 =
        (getByte64(s, i) << 18) |
        (getByte64(s, i + 1) << 12) |
        (getByte64(s, i + 2) << 6) |
        getByte64(s, i + 3)
      x[index++] = b10 >> 16
      x[index++] = (b10 >> 8) & 255
      x[index++] = b10 & 255
    }
    switch (pads) {
      case 1:
        b10 =
          (getByte64(s, i) << 18) |
          (getByte64(s, i + 1) << 12) |
          (getByte64(s, i + 2) << 6)
        x[index++] = b10 >> 16
        x[index++] = (b10 >> 8) & 255
        break
      case 2:
        b10 = (getByte64(s, i) << 18) | (getByte64(s, i + 1) << 12)
        x[index++] = b10 >> 16
        break
    }

    return x
  }

  function getByte64(s: string, i: u32): u32 {
    return ALPHA.indexOf(s.charAt(i))
  }
}
