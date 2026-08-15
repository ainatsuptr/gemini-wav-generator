# gemini-wav-generator

[![CI](https://github.com/ainatsuptr/gemini-wav-generator/actions/workflows/ci.yml/badge.svg)](https://github.com/ainatsuptr/gemini-wav-generator/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

CLI that generates WAV audio from text using [Gemini TTS](https://docs.cloud.google.com/text-to-speech/docs/gemini-tts) through [Vertex AI](https://ai-sdk.dev/docs/guides/vertex) and the [Vercel AI SDK](https://ai-sdk.dev/docs/reference/ai-sdk-core/generate-speech).

Gemini TTS（Vertex AI 経由）を使い、テキストから WAV 音声ファイルを生成する CLI です。

> The default model is `gemini-3.1-flash-tts-preview` (preview). Availability and naming may change.
>
> 既定モデルはプレビュー版です。提供状況やモデル名は変わることがあります。

## Prerequisites / 前提条件

- [Bun](https://bun.sh/) 1.1 or later
- [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) (`gcloud`)
- A GCP project with [billing](https://cloud.google.com/billing/docs/how-to/verify-billing-enabled) enabled
- [Vertex AI API](https://console.cloud.google.com/apis/library/aiplatform.googleapis.com) enabled on that project

## Setup / セットアップ

```bash
bun install
```

### Authentication / 認証

Set Application Default Credentials (ADC) on your machine:

```bash
gcloud auth application-default login
```

Do **not** commit `.env`, service-account JSON, or ADC files.

`.env`・サービスアカウント JSON・ADC ファイルはコミットしないでください。

### Environment variables / 環境変数

Copy `.env.example` to `.env` and set your GCP project:

```bash
cp .env.example .env
```

Bun loads `.env` automatically. This CLI requires Bun (it does not load `.env` under Node.js).

Bun は `.env` を自動読み込みします。この CLI は Bun 必須です。

| Variable | Required | Description |
| --- | --- | --- |
| `GOOGLE_VERTEX_PROJECT` | Yes | GCP project ID |
| `GOOGLE_VERTEX_LOCATION` | Yes | Vertex AI region (example: `us-central1`) |
| `GOOGLE_APPLICATION_CREDENTIALS` | No | Path to a service-account JSON. Usually unnecessary because ADC is used |

## Usage / 使い方

```bash
bun run generate --text "Hello, world!"
```

With output path and options:

```bash
bun run generate \
  --text "Hello, world!" \
  --output output/hello.wav \
  --voice Kore \
  --instructions "Speak in a bright, energetic tone"
```

Fail if the generated duration is outside an expected range (exits with status 1):

生成音声の長さが範囲外ならエラー終了します（終了コード 1）:

```bash
bun run generate --text "Hello" --min-duration 3 --max-duration 5
```

### Options / オプション

| Option | Required | Default | Description |
| --- | --- | --- | --- |
| `--text`, `-t` | Yes | - | Text to speak |
| `--output`, `-o` | No | `output/speech.wav` | Output WAV path |
| `--voice`, `-v` | No | `Kore` | Voice name ([30 prebuilt voices](https://ai.google.dev/gemini-api/docs/speech-generation#voices), e.g. `Kore`, `Puck`, `Zephyr`) |
| `--instructions`, `-i` | No | - | Speaking style (tone, speed, etc.) |
| `--min-duration` | No | - | Minimum duration in seconds. Below this, the process exits with an error |
| `--max-duration` | No | - | Maximum duration in seconds. Above this, the process exits with an error |

## Output / 出力先

Generated WAV files are written to `output/` by default. The directory is tracked in git; `*.wav` files are gitignored.

生成された WAV は既定で `output/` に保存されます。ディレクトリ自体は Git 管理下ですが、`.wav` 本体は `.gitignore` で除外されます。

## Development / 開発

```bash
bun test
```

## License

[MIT](LICENSE)
