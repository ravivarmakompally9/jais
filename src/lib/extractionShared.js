// =====================================================================
// Shared bits used by both the Anthropic and OpenAI extraction modules:
//   - the SYSTEM_PROMPT (single source of truth)
//   - fileToBase64()
//   - parseJsonStrict()
// =====================================================================

export const SYSTEM_PROMPT = `You are an expert Indian legal analyst working for a state government's e-Governance department. Analyze this court judgment PDF thoroughly and extract all information needed for government compliance.

Return ONLY valid JSON (no markdown fences, no preamble) in this EXACT structure:
{
  "caseNumber": "exact case number",
  "title": "short descriptive title, max 80 chars",
  "court": "name of court",
  "bench": "bench composition if mentioned",
  "dateOfOrder": "YYYY-MM-DD",
  "dateOfFiling": "YYYY-MM-DD or null",
  "petitioner": "full petitioner name and designation",
  "respondent": "full respondent name and designation",
  "deptRole": "petitioner or respondent (which role does the government department play)",
  "disposalStatus": "disposed or partially_disposed or pending",
  "documentType": "digital or scanned (infer from text quality)",
  "summary": "3-4 sentence summary covering: what happened, what the court ordered, and key implications for the government",
  "department": "primary government department involved",
  "directions": [
    {
      "text": "clear description of the court's direction",
      "sourceQuote": "exact verbatim quote from judgment (the operative portion containing this direction)",
      "timeline": "timeline as stated in judgment",
      "timelineType": "explicit (if court stated a deadline) or inferred (if you calculated/estimated it)",
      "calculatedDeadline": "YYYY-MM-DD (compute from order date + stated timeline)",
      "confidence": 85,
      "confidenceReason": "explain WHY this confidence level - what makes it certain or uncertain",
      "page": 1
    }
  ],
  "appealAnalysis": {
    "recommendation": "no_appeal or consider_appeal or strong_consider_appeal",
    "limitationPeriod": "applicable limitation period with legal basis",
    "limitationDeadline": "YYYY-MM-DD or null",
    "appealCourt": "which court to appeal to",
    "grounds": "potential grounds for appeal if any",
    "reasoning": "detailed reasoning for appeal recommendation considering financial impact, legal merit, and practical implications",
    "riskIfNoAppeal": "what happens if no appeal is filed"
  },
  "actions": [
    {
      "type": "compliance or appeal_consideration",
      "natureOfAction": "financial or administrative or legal or regulatory",
      "description": "specific action with enough detail for a government officer to act",
      "department": "responsible department",
      "responsibleAuthority": "specific designation of the officer responsible (e.g., Principal Secretary, District Collector)",
      "timeline": "narrative description of the timeline (e.g., '90 days from order' or 'Mid-window of compliance period')",
      "timelineType": "explicit (court fixed this date / window) or inferred (you derived this date from the order/timeline)",
      "deadline": "YYYY-MM-DD",
      "priority": "critical or high or medium or low",
      "status": "pending"
    }
  ]
}

IMPORTANT RULES:
- For confidence: 90-98 = directly stated in operative order; 75-89 = clearly implied but requires interpretation; 60-74 = inferred from context
- For sourceQuote: copy the EXACT text from the judgment's operative portion
- For appealAnalysis: consider the government's role (petitioner vs respondent), financial impact, and legal precedent
- For responsibleAuthority: use specific designations, not vague terms
- For deptRole: determine if the government is filing the case (petitioner) or defending (respondent) — this critically affects the action plan
- Calculate all deadlines precisely from the date of order
- For each action's timelineType: mark "explicit" only when the operative order names a specific date or fixed window for THIS action; mark "inferred" when you derived the deadline from a broader compliance window or implicit timing
- For each action's timeline: write the narrative the officer should see (e.g., "90 days from order — court-fixed", "Mid-point of 90-day compliance window")
- If the document appears scanned (OCR artifacts, image-based text), set documentType to "scanned"`

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      const base64 = result.split(',')[1] // strip "data:application/pdf;base64," prefix
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function parseJsonStrict(text) {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')

  // Be defensive — pull the largest { ... } slice if there's noise around it
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  const slice = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned

  try {
    return JSON.parse(slice)
  } catch {
    throw new Error('Provider returned invalid JSON. First 400 chars: ' + cleaned.slice(0, 400))
  }
}
