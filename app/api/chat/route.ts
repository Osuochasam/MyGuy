import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt } = await req.json()

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        message: "Connect an AI provider in Settings to enable full chat. Your memories are already being searched locally.",
      })
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        max_tokens: 600,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('[Chat API] OpenAI error:', err)
      return NextResponse.json({ message: 'AI provider returned an error. Check your API key in Settings.' })
    }

    const data = await response.json()
    const message = data.choices?.[0]?.message?.content || 'No response generated.'
    return NextResponse.json({ message })
  } catch (err) {
    console.error('[Chat API] Error:', err)
    return NextResponse.json({ message: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
