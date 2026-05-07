// =====================================================================
// Anthropic Claude extraction provider
//
// Uses the Messages API with PDF input via the `document` content type.
// Native PDF support — no fragile OCR pipeline.
//
// IMPORTANT — security note for the demo:
//   We call the Anthropic API directly from the browser using the key
//   in import.meta.env. For production, proxy this through a backend.
// =====================================================================

import { fileToBase64, SYSTEM_PROMPT, parseJsonStrict } from './extractionShared'

const API_URL = 'https://api.anthropic.com/v1/messages'

export const isClaudeConfigured = Boolean(import.meta.env.VITE_ANTHROPIC_API_KEY)

export async function extractWithClaude(file) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('VITE_ANTHROPIC_API_KEY is not set in .env')

  const model = import.meta.env.VITE_ANTHROPIC_MODEL || 'claude-sonnet-4-20250514'
  const base64 = await fileToBase64(file)

  const body = {
    model,
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: base64,
            },
          },
          {
            type: 'text',
            text: 'Extract every field of the JSON schema accurately. Output JSON only, no markdown fences.',
          },
        ],
      },
    ],
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Claude API ${res.status}: ${text}`)
  }

  const json = await res.json()
  const text = json.content?.[0]?.text || ''
  return parseJsonStrict(text)
}

// Legacy alias used elsewhere in the codebase
export const extractJudgmentFromPdf = extractWithClaude
