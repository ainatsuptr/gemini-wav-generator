/**
 * WAV (RIFF) ヘッダをバイトオフセット固定で解析し、再生時間を推定する。
 * @param {Buffer} buffer
 * @returns {number | null} 秒数。解析できない場合は null。
 */
export function getWavDurationSec(buffer) {
  if (buffer.length < 44) return null

  const sampleRate = buffer.readUInt32LE(24)
  const numChannels = buffer.readUInt16LE(22)
  const bitsPerSample = buffer.readUInt16LE(34)
  const dataSize = buffer.readUInt32LE(40)

  if (!sampleRate || !numChannels || !bitsPerSample) return null

  const bytesPerSample = (bitsPerSample / 8) * numChannels
  return dataSize / bytesPerSample / sampleRate
}
