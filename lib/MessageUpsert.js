import { router } from './router.js'

export async function MessageUpsert(sock, db, m) {
  try {
    const msg = m.messages[0]
    if (!msg.message || msg.key.remoteJid === 'status@broadcast' && !db.data.statusView) return

    // Auto read if enabled
    if (db.data.autoRead) {
      await sock.readMessages([msg.key])
    }

    // Status view if enabled
    if (msg.key.remoteJid === 'status@broadcast' && db.data.statusView) {
      await sock.readMessages([msg.key])
    }

    // Pass to router - handles viewOnce, doc, sticker, status, everything
    await router(msg, sock, db)

  } catch (e) {
    console.log('[MESSAGEUPSERT ERROR]', e.message)
  }
}
