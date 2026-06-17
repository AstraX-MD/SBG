import { router } from './router.js'

export async function MessageUpsert(sock, db, m) {
  try {
    const msg = m.messages[0]
    if (!msg.message) return
    
    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
    const jid = msg.key.remoteJid
    
    const context = {
      body,
      jid,
      sender: msg.key.participant || msg.key.remoteJid,
      fromMe: msg.key.fromMe,
      msg
    }

    await router(context, sock, db)
    
  } catch (err) {
    console.error('MessageUpsert Error:', err)
  }
}
