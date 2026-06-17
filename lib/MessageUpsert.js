import { router } from './router.js'
import { agentQuery } from './ai/flow/agent-logic.js'

export async function MessageUpsert(sock, db, m) {
  try {
    const msg = m.messages[0]
    if (!msg.message || msg.key.remoteJid === 'status@broadcast') return
    
    const jid = msg.key.remoteJid
    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || ''
    const sender = msg.key.participant || msg.key.remoteJid
    const pushName = msg.pushName || 'User'
    const fromMe = msg.key.fromMe
    
    const context = {
      body,
      jid,
      sender,
      pushName,
      fromMe,
      msg
    }

    const prefix = db.get('prefix') || '.'
    const isCmd = body.startsWith(prefix)
    const isMentioned = body.includes(`@${sock.user.id.split(':')[0]}`)

    if (isCmd) {
      await router(context, sock, db)
    } else if (isMentioned || (db.get('mode') === 'public' && !fromMe && body.length > 0)) {
       await agentQuery(context, sock, db)
    }
    
  } catch (err) {
    console.error('MessageUpsert Error:', err)
  }
}