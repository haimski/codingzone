export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }

  const body = await req.json()
  const { question, answer, gradingCriteria, questionType, topicTitle } = body

  if (!question || !answer) {
    return Response.json({ error: 'question and answer required' }, { status: 400 })
  }

  const prompt = `You are a senior software engineer grading a technical interview answer.

Topic: "${topicTitle}"
Question type: ${questionType}
Question: "${question}"

Grading criteria:
${gradingCriteria.map((c: string, i: number) => `${i + 1}. ${c}`).join('\n')}

Student's answer:
"""
${answer}
"""

Grade this answer honestly. Be tough but fair.

Return ONLY valid JSON, no markdown:
{
  "score": 75,
  "feedback": "2-3 sentence overall assessment",
  "strengths": ["specific strength 1", "specific strength 2"],
  "improvements": ["specific gap 1", "what to study next"],
  "criteriaResults": [
    { "criterion": "...", "met": true, "comment": "brief note" }
  ]
}

Score 0-100:
- 0-40: Missing core concepts
- 41-60: Partial understanding
- 61-75: Solid grasp, minor gaps
- 76-89: Strong answer
- 90-100: Exceptional`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()
    const text = data.content?.[0]?.text ?? ''
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(clean)
    return Response.json(parsed)
  } catch (err) {
    console.error('Score error:', err)
    return Response.json({ error: 'Failed to grade answer' }, { status: 500 })
  }
}
