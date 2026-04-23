export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }

  const body = await req.json()
  const { targetRole, targetLevel, phase, completedTopics, overallScore, action, conversation } = body

  if (action === 'start') {
    const prompt = `You are a senior engineer at a top tech company conducting a ${targetLevel} ${targetRole} interview.

The candidate has completed ${completedTopics} topics with an overall readiness score of ${overallScore}/100.
Focus: Phase ${phase} (0=JS/CSS, 1=React/Frontend, 2=Node.js/Backend)

Start with a warm but professional greeting, then ask your first technical question appropriate for a ${targetLevel} role.
Keep it concise — max 4 sentences total.

Return ONLY valid JSON, no markdown:
{
  "message": "your greeting and first question",
  "questionType": "conceptual",
  "isFollowUp": false
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
          model: 'claude-sonnet-4-6',
          max_tokens: 400,
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      const data = await response.json()
      const text = data.content?.[0]?.text ?? ''
      const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      return Response.json(JSON.parse(clean))
    } catch (err) {
      console.error('Interview start error:', err)
      return Response.json({ error: 'Failed to start interview' }, { status: 500 })
    }
  }

  if (action === 'answer') {
    const messages = conversation.map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
    }))

    const systemPrompt = `You are a senior engineer conducting a ${targetLevel} ${targetRole} interview.
Be professional but conversational. React honestly to the candidate's answer.
If strong, acknowledge briefly and ask a follow-up or move to the next topic.
If weak, probe or redirect gently.
After 4-5 exchanges, wrap up with feedback and a score.

Return ONLY valid JSON, no markdown:
{
  "message": "your response",
  "score": null,
  "isComplete": false,
  "feedback": null
}
When wrapping up use:
{
  "message": "closing statement",
  "score": 72,
  "isComplete": true,
  "feedback": "2-3 sentence overall feedback"
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
          model: 'claude-sonnet-4-6',
          max_tokens: 500,
          system: systemPrompt,
          messages,
        }),
      })
      const data = await response.json()
      const text = data.content?.[0]?.text ?? ''
      const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      return Response.json(JSON.parse(clean))
    } catch (err) {
      console.error('Interview answer error:', err)
      return Response.json({ error: 'Failed to process answer' }, { status: 500 })
    }
  }

  return Response.json({ error: 'Invalid action' }, { status: 400 })
}
