// =====================================================================
// Provider router — picks OpenAI or Anthropic based on which key is
// configured. Override with VITE_AI_PROVIDER=openai|anthropic in .env.
//
// Exposes a single function the UI can call regardless of provider.
// =====================================================================

import { extractWithClaude, isClaudeConfigured } from './claude'
import { extractWithOpenAI, isOpenAIConfigured } from './openai'

export function getActiveProvider() {
  const forced = (import.meta.env.VITE_AI_PROVIDER || '').toLowerCase().trim()
  if (forced === 'openai' && isOpenAIConfigured) return 'openai'
  if (forced === 'anthropic' && isClaudeConfigured) return 'anthropic'

  // Auto-pick: prefer OpenAI (most users have those keys), fall back to Anthropic
  if (isOpenAIConfigured) return 'openai'
  if (isClaudeConfigured) return 'anthropic'
  return null
}

export const isExtractionConfigured = Boolean(getActiveProvider())

export function activeModelLabel() {
  const p = getActiveProvider()
  if (p === 'openai') return `OpenAI · ${import.meta.env.VITE_OPENAI_MODEL || 'gpt-4.1'}`
  if (p === 'anthropic')
    return `Anthropic · ${import.meta.env.VITE_ANTHROPIC_MODEL || 'claude-sonnet-4'}`
  return 'No provider configured'
}

export async function extractJudgmentFromPdf(file) {
  const provider = getActiveProvider()
  if (provider === 'openai') return extractWithOpenAI(file)
  if (provider === 'anthropic') return extractWithClaude(file)
  throw new Error(
    'No AI provider configured. Set VITE_OPENAI_API_KEY or VITE_ANTHROPIC_API_KEY in .env.'
  )
}
