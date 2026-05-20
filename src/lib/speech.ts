/**
 * Web Speech API 헬퍼 — 브라우저 내장 TTS.
 * W4까지의 V1 사운드 솔루션. Kokoro mp3가 준비되면 mp3 우선, fallback으로 TTS.
 */

let cachedVoices: SpeechSynthesisVoice[] | null = null

function getVoices(): Promise<SpeechSynthesisVoice[]> {
  if (cachedVoices && cachedVoices.length > 0) return Promise.resolve(cachedVoices)
  return new Promise((resolve) => {
    const tryGet = () => {
      const list = window.speechSynthesis.getVoices()
      if (list.length > 0) {
        cachedVoices = list
        resolve(list)
      }
    }
    tryGet()
    if (!cachedVoices) {
      window.speechSynthesis.onvoiceschanged = () => tryGet()
      // Safety timeout
      setTimeout(() => {
        if (!cachedVoices) {
          cachedVoices = window.speechSynthesis.getVoices()
          resolve(cachedVoices)
        }
      }, 600)
    }
  })
}

export function isTTSAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

interface SpeakOptions {
  rate?: number      // 0.5 ~ 1.5
  pitch?: number     // 0 ~ 2
  voiceURI?: string  // optional, prefer specific voice
  lang?: string      // default 'en-US'
  onEnd?: () => void
  onError?: (e: SpeechSynthesisErrorEvent) => void
}

export async function speak(text: string, opts: SpeakOptions = {}): Promise<void> {
  if (!isTTSAvailable()) return
  cancel()
  const voices = await getVoices()
  const lang = opts.lang ?? 'en-US'
  // Prefer en-US natural voice
  const preferred =
    voices.find((v) => v.voiceURI === opts.voiceURI) ??
    voices.find((v) => v.lang === lang && /natural|google|samantha|alex|enhanced/i.test(v.name)) ??
    voices.find((v) => v.lang === lang) ??
    voices.find((v) => v.lang.startsWith(lang.slice(0, 2))) ??
    voices[0]

  const utter = new SpeechSynthesisUtterance(text)
  if (preferred) utter.voice = preferred
  utter.lang = preferred?.lang ?? lang
  utter.rate = opts.rate ?? 0.95
  utter.pitch = opts.pitch ?? 1
  if (opts.onEnd) utter.onend = opts.onEnd
  if (opts.onError) utter.onerror = opts.onError
  window.speechSynthesis.speak(utter)
}

export function cancel() {
  if (!isTTSAvailable()) return
  window.speechSynthesis.cancel()
}

export function pause() {
  if (!isTTSAvailable()) return
  window.speechSynthesis.pause()
}

export function resume() {
  if (!isTTSAvailable()) return
  window.speechSynthesis.resume()
}
