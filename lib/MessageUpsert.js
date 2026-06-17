import { routeMessage } from './router.js'

export async function MessageUpsert(sock, db, m) {
  try {
    if (!m.message) return

    // Auto read if enabled
    if (db.data.autoRead) {
      await sock.readMessages([m.key])
    }

    // Status view if enabled
    if (m.key.remoteJid === 'status@broadcast' && db.data.statusView) {
      await sock.readMessages([m.key])
      logger.msg('STATUS', 'Viewed status from broadcast')
    }

    // Pass to router
    await routeMessage(sock, m)

  } catch (e) {
    logger.error('MESSAGEUPSERT', `Error in MessageUpsert: ${e.message}`)
  }
}