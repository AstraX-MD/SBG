export async function agentQuery(context, sock, db) {
  const apiKey = db.get('groqKey')
  if (!apiKey) return

  const { body, jid, msg, pushName } = context
  const botName = db.get('botname')
  const prefix = db.get('prefix')

  const systemPrompt = `You are ${botName} bot. Prefix: ${prefix}. You know all commands and features. Answer short and clean.`
  
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: body }
        ]
      })
    })

    const data = await response.json()
    const result = data.choices?.[0]?.message?.content

    if (result) {
      const text = `╭❖『 🧠 AI 』
│
├❖ ${result}
│
╰❖ *${botName} ${db.get('presents')}* 🦚`
      await sock.sendMessage(jid, { text }, { quoted: msg })
    }
  } catch (err) {
    // Silently skip if error
  }
}