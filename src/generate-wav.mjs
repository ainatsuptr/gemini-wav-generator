#!/usr/bin/env bun
/**
 * Gemini TTS (Vertex AI 経由) でテキストから WAV ファイルを生成する汎用CLI。
 *
 * Usage:
 *   bun run generate --text "こんにちは"
 *   bun run generate --text "こんにちは" --output output/hello.wav --voice Kore
 *
 * 認証: 事前に `gcloud auth application-default login` を実行しておくこと。
 */
import { generateSpeech } from "ai"
import { mkdirSync, writeFileSync } from "node:fs"
import { dirname } from "node:path"
import { parseArgs } from "node:util"

import { createVertexClient, DEFAULT_SPEECH_MODEL } from "./lib/vertex-client.mjs"
import { getWavDurationSec } from "./lib/wav.mjs"

const { values } = parseArgs({
  options: {
    text: { type: "string", short: "t" },
    output: { type: "string", short: "o", default: "output/speech.wav" },
    voice: { type: "string", short: "v", default: "Kore" },
    instructions: { type: "string", short: "i" },
    "min-duration": { type: "string" },
    "max-duration": { type: "string" },
    help: { type: "boolean", short: "h" },
  },
})

if (values.help || !values.text) {
  console.log(`Usage: bun run generate --text <text> [options]

Options:
  -t, --text <string>          読み上げるテキスト（必須）
  -o, --output <path>          出力先WAVパス（デフォルト: output/speech.wav）
  -v, --voice <string>         音声名（デフォルト: Kore）
  -i, --instructions <string>  話し方の指示（任意）
      --min-duration <sec>     期待する最短秒数（任意、下回るとエラー終了）
      --max-duration <sec>     期待する最長秒数（任意、上回るとエラー終了）
  -h, --help                   このヘルプを表示`)
  process.exit(values.help ? 0 : 1)
}

const outputPath = values.output
const minDuration = values["min-duration"] ? Number(values["min-duration"]) : null
const maxDuration = values["max-duration"] ? Number(values["max-duration"]) : null

const vertex = createVertexClient()

console.log("--- WAV 生成 ---")
console.log(`text: ${values.text.slice(0, 40)}${values.text.length > 40 ? "..." : ""}`)
console.log(`voice: ${values.voice}`)

const result = await generateSpeech({
  model: vertex.speech(DEFAULT_SPEECH_MODEL),
  text: values.text,
  voice: values.voice,
  ...(values.instructions ? { instructions: values.instructions } : {}),
})

const audioBuffer = Buffer.from(result.audio.uint8Array)
mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, audioBuffer)

const durationSec = getWavDurationSec(audioBuffer)
console.log(`出力: ${outputPath}`)
console.log(`mime: ${result.audio.mediaType}`)
console.log(`size: ${audioBuffer.length} bytes`)

if (durationSec !== null) {
  console.log(`duration: ${durationSec.toFixed(2)}s`)
  if ((minDuration !== null && durationSec < minDuration) || (maxDuration !== null && durationSec > maxDuration)) {
    console.warn(`⚠️  目標尺 ${minDuration ?? "-"}〜${maxDuration ?? "-"}s の範囲外です。`)
    process.exit(1)
  }
} else {
  console.warn("⚠️  WAV 尺を計算できませんでした。手動で試聴してください。")
}

console.log("生成完了")
