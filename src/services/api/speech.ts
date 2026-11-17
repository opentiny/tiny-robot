import { ApiError, API_ORIGIN, request } from "./client.js";

/**
 * 语音接口：
 * - ASR：POST /v1/tools/asr，multipart 上传 WAV / Ogg Opus，一次返回全文
 * - TTS：POST /v1/tools/tts，返回音频字节流（产出首帧后即返回 200）
 * 鉴权都用 Authorization: Bearer。
 */
const TOOLS_BASE_URL = `${API_ORIGIN}/v1/tools`;

export type TtsVoice = "stella" | "tide";

/** TTS 输出的裸 PCM 参数：24kHz、单声道、16-bit 小端 */
export const TTS_SAMPLE_RATE = 24000;

/** 语音识别：audio 为 WAV（单声道 16-bit PCM）或 Ogg Opus，时长不超过 120 秒、大小不超过 8 MiB */
export const transcribe = async (
  apiKey: string,
  audio: Blob,
  signal?: AbortSignal,
): Promise<string> => {
  const form = new FormData();
  form.append("file", audio, "recording.wav");
  const response = await request(`${TOOLS_BASE_URL}/asr`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
    signal,
  });
  const raw = await response.text();
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    throw new ApiError("protocol", raw);
  }
  if (
    typeof body !== "object" ||
    body === null ||
    !("text" in body) ||
    typeof body.text !== "string"
  ) {
    throw new ApiError("protocol", raw);
  }
  return body.text;
};

/** 语音合成：返回裸 PCM 字节流；服务端默认过滤代码块、表格、引用标记与长公式 */
export const synthesize = async (
  apiKey: string,
  text: string,
  voice: TtsVoice,
  signal: AbortSignal,
): Promise<ReadableStream<Uint8Array>> => {
  const response = await request(`${TOOLS_BASE_URL}/tts`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice_id: voice, format: "pcm", filter_markdown: true }),
    signal,
  });
  if (!response.body) {
    throw new ApiError("protocol", await response.text());
  }
  return response.body;
};
