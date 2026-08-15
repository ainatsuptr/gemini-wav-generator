import { describe, expect, test } from "bun:test"

import { getWavDurationSec } from "./wav.mjs"

/**
 * Build a minimal PCM WAV header. Duration is derived from header fields only.
 * @param {{ sampleRate: number, numChannels: number, bitsPerSample: number, dataSize: number, length?: number }} params
 */
function makeWavHeader({ sampleRate, numChannels, bitsPerSample, dataSize, length = 44 }) {
  const buffer = Buffer.alloc(length)
  if (length < 44) return buffer

  buffer.write("RIFF", 0)
  buffer.writeUInt32LE(36 + dataSize, 4)
  buffer.write("WAVE", 8)
  buffer.write("fmt ", 12)
  buffer.writeUInt32LE(16, 16)
  buffer.writeUInt16LE(1, 20)
  buffer.writeUInt16LE(numChannels, 22)
  buffer.writeUInt32LE(sampleRate, 24)
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8)
  buffer.writeUInt32LE(byteRate, 28)
  buffer.writeUInt16LE(numChannels * (bitsPerSample / 8), 32)
  buffer.writeUInt16LE(bitsPerSample, 34)
  buffer.write("data", 36)
  buffer.writeUInt32LE(dataSize, 40)
  return buffer
}

describe("getWavDurationSec", () => {
  test("returns 1 second for 44100 Hz mono 16-bit with 88200 data bytes", () => {
    const buffer = makeWavHeader({
      sampleRate: 44100,
      numChannels: 1,
      bitsPerSample: 16,
      dataSize: 88200,
    })

    expect(getWavDurationSec(buffer)).toBe(1)
  })

  test("returns 2 seconds for stereo 16-bit at 48000 Hz", () => {
    const buffer = makeWavHeader({
      sampleRate: 48000,
      numChannels: 2,
      bitsPerSample: 16,
      dataSize: 384000,
    })

    expect(getWavDurationSec(buffer)).toBe(2)
  })

  test("returns null when the buffer is shorter than a WAV header", () => {
    expect(getWavDurationSec(Buffer.alloc(43))).toBeNull()
  })

  test("returns null when sample rate, channels, or bit depth is zero", () => {
    expect(
      getWavDurationSec(
        makeWavHeader({ sampleRate: 0, numChannels: 1, bitsPerSample: 16, dataSize: 88200 }),
      ),
    ).toBeNull()
    expect(
      getWavDurationSec(
        makeWavHeader({ sampleRate: 44100, numChannels: 0, bitsPerSample: 16, dataSize: 88200 }),
      ),
    ).toBeNull()
    expect(
      getWavDurationSec(
        makeWavHeader({ sampleRate: 44100, numChannels: 1, bitsPerSample: 0, dataSize: 88200 }),
      ),
    ).toBeNull()
  })
})
