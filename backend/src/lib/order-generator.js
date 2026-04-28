const OpenAI = require('openai')

const { DomainError } = require('./domain-error')

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const parseGeneratedOrder = text => {
  if (!text) {
    throw new DomainError('AI service returned an empty response', { status: 502 })
  }
  try {
    return JSON.parse(text)
  } catch {
    throw new DomainError('AI service returned an invalid response', { status: 502 })
  }
}

module.exports = async function (prompt) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a logistics order assistant. Parse the user's natural language request into a structured JSON order.
Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{
  "origin": "Name, city or address string",
  "destination": "Name, city or address string",
  "deliveryDate": "YYYY-MM-DD",
  "cargos": [
    {
      "loadCarrierType": "string (e.g. Pallet, Box, Container)",
      "dimensions": {
        "width": number_in_cm,
        "length": number_in_cm,
        "height": number_in_cm
      },
      "weight": number_in_kg,
      "quantity": number
    }
  ]
}

Rules:
- If the user doesn't specify dimensions, use reasonable defaults for the loadCarrierType (e.g. standard pallet: 80x120x15 cm).
- If the user doesn't specify weight, estimate a reasonable weight.
- If the user doesn't specify a delivery date, use a date 7 days from today.
- If the user doesn't specify cargo type, default to "Pallet".
- Always return at least one cargo item.
- Today's date is ${new Date().toISOString().split('T')[0]}.`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
    max_tokens: 1000,
  })

  const text = response.choices?.[0]?.message?.content || ''
  return parseGeneratedOrder(text)
}
