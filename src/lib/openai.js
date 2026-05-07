// =====================================================================
// OpenAI extraction provider
//
// Uses the Chat Completions API with PDF input via the `file` content
// type — supported on multimodal models (gpt-4.1, gpt-4o, gpt-5).
//
// IMPORTANT — security note for the demo:
//   We call the OpenAI API directly from the browser using the key in
//   import.meta.env. This is fine for a local-dev demo but in production
//   you MUST proxy this through a backend so the API key never reaches
//   the client.
// =====================================================================

import { fileToBase64, SYSTEM_PROMPT, parseJsonStrict } from './extractionShared'

const API_URL = 'https://api.openai.com/v1/chat/completions'

export const isOpenAIConfigured = Boolean(import.meta.env.VITE_OPENAI_API_KEY)

export async function extractWithOpenAI(file) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) throw new Error('VITE_OPENAI_API_KEY is not set in .env')

  const model = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4.1'
  const base64 = await fileToBase64(file)

  const body = {
    model,
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: [
          {
            type: 'file',
            file: {
              filename: file.name || 'judgment.pdf',
              file_data: `data:application/pdf;base64,${base64}`,
            },
          },
          {
            type: 'text',
            text: 'Extract every field of the JSON schema accurately. Output JSON only, no markdown fences.',
          },
        ],
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OpenAI API ${res.status}: ${text}`)
  }

  const json = await res.json()
  const text = json.choices?.[0]?.message?.content || ''
  return parseJsonStrict(text)
}
