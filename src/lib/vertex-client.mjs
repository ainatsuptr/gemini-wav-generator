import { createVertex } from "@ai-sdk/google-vertex"

/**
 * Vertex AI クライアントを生成する。
 * 認証は google-auth-library の標準 ADC 解決に委ねる。
 * 事前に `gcloud auth application-default login` を実行しておくこと。
 */
export function createVertexClient() {
  const project = process.env.GOOGLE_VERTEX_PROJECT
  const location = process.env.GOOGLE_VERTEX_LOCATION

  if (!project || !location) {
    throw new Error(
      "GOOGLE_VERTEX_PROJECT と GOOGLE_VERTEX_LOCATION を .env に設定してください"
    )
  }

  return createVertex({ project, location })
}

export const DEFAULT_SPEECH_MODEL = "gemini-3.1-flash-tts-preview"
