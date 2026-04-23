export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }

  const body = await req.json()
  const { topicTitle, topicSection, phase, interviewWeight, pastScores, targetLevel } = body

  if (!topicTitle) {
    return Response.json({ error: 'topicTitle required' }, { status: 400 })
  }

  const avgPastScore = pastScores?.length
    ? pastScores.reduce((a: number, b: number) => a + b, 0) / pastScores.length
    : null

  const difficulty = avgPastScore === null
    ? 'mixed (easy to medium)'
    : avgPastScore < 40 ? 'easy to medium — student is struggling'
    : avgPastScore < 70 ? 'medium to hard — student has basics'
    : 'hard to expert — student is performing well'

  const prompt = `You are a senior software engineer conducting a technical interview.

Topic: "${topicTitle}"
Section: "${topicSection}"
Phase: ${phase} (0=JS/CSS foundations, 1=React/Frontend, 2=Node.js/Backend)
Interview weight: ${interviewWeight}
Target role level: ${targetLevel || 'mixed'}
Past exam scores: ${pastScores?.length ? pastScores.join(', ') : 'none yet'}
Difficulty: ${difficulty}

Generate exactly 3 exam questions. Mix conceptual and code-challenge types.

Return ONLY valid JSON, no markdown fences:
{
  "questions": [
    {
      "id": "q1",
      "type": "conceptual",
      "question": "...",
      "codeStarter": "",
      "gradingCriteria": ["criterion 1", "criterion 2", "criterion 3"],
      "difficulty": 2,
      "roleLevel": "mid"
    },
    {
      "id": "q2",
      "type": "code-challenge",
      "question": "...",
      "codeStarter": "// starter code",
      "gradingCriteria": ["criterion 1", "criterion 2"],
      "difficulty": 2,
      "roleLevel": "mid"
    },
    {
      "id": "q3",
      "type": "conceptual",
      "question": "...",
      "codeStarter": "",
      "gradingCriteria": ["criterion 1", "criterion 2"],
      "difficulty": 3,
      "roleLevel": "senior"
    }
  ]
}`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()
    const text = data.content?.[0]?.text ?? ''
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(clean)
    return Response.json(parsed)
  } catch (err) {
    console.error('Exam error:', err)
    return Response.json({ error: 'Failed to generate questions' }, { status: 500 })
  }
}
