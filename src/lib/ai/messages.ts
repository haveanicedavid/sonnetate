import Anthropic from '@anthropic-ai/sdk'

import { createSystemPrompt } from './prompts'

export async function* streamSummarization({
  url,
  apiKey,
  tags,
  prompt,
}: {
  url: string
  apiKey?: string
  tags?: string
  prompt?: string
}) {
  if (!apiKey) throw new Error('API key is required')

  const anthropic = new Anthropic({
    apiKey,
  })

  const content = prompt
    ? `look at the webpage ${url} and use it for the following prompt. Make sure you use it for the first heading you respond with. {{prompt}}:\n\n${prompt}`
    : `summarize the following webpage:: ${url}`

  const stream = await anthropic.messages.create({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 1000,
    temperature: 0.5,
    system: createSystemPrompt(tags),
    messages: [
      {
        role: 'user',
        content,
      },
    ],
    stream: true,
  })

  for await (const chunk of stream) {
    if (
      chunk.type === 'content_block_delta' &&
      chunk.delta.type === 'text_delta'
    ) {
      yield chunk.delta.text
    }
  }
}
