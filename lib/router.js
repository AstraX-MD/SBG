import db from './database.js'

let commands = new Map()
let observers = new Map()

export function setCommands(cmds) {
  commands = cmds
  logger.success('ROUTER', `Registered ${cmds.size} commands`)
}

export function setObservers(obs) {
  observers = obs
}

export async function routeMessage(sock, m) {
  try {
    if (!m.message) return
    const from = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid
    const pushName = m.pushName || sender.split('@')[0]

    // EXTRACT MESSAGE CONTENT
    const message = m.message?.ephemeralMessage?.message || 
                    m.message?.viewOnceMessageV2?.message || 
                    m.message?.viewOnceMessage?.message || 
                    m.message?.documentWithCaptionMessage?.message || 
                    m.message
    
    const body = (message?.conversation || 
                  message?.extendedTextMessage?.text || 
                  message?.imageMessage?.caption || 
                  message?.videoMessage?.caption || 
                  message?.documentMessage?.caption || '').trim()

    // DETECT MEDIA & JID TYPE
    const mediaType = message?.imageMessage ? 'IMAGE' : 
                      message?.videoMessage ? 'VIDEO' : 
                      message?.audioMessage ? 'AUDIO' : 
                      message?.stickerMessage ? 'STICKER' : 
                      message?.documentMessage ? 'DOCUMENT' : 
                      message?.ptvMessage ? 'PTV' : 'TEXT'
    
    const jidType = from.endsWith('@g.us') ? 'GROUP' : 
                    from.endsWith('@newsletter') ? 'CHANNEL' : 
                    from === 'status@broadcast' ? 'STATUS' : 'DM'

    const prefix = db.get('prefix')
    const isCmd = body.startsWith(prefix)

    // INITIAL LOG FOR EVERY MESSAGE
    logger.incoming(from, pushName, body.slice(0, 30), mediaType, jidType, false)

    if (!body && !message?.stickerMessage && !message?.audioMessage && !message?.imageMessage && !message?.videoMessage) return

    if (isCmd) {
      // LOG AGAIN WITH CMD FLAG
      logger.incoming(from, pushName, body.slice(0, 30), mediaType, jidType, true)
      
      const args = body.slice(prefix.length).trim().split(/ +/)
      const cmdName = args.shift().toLowerCase()
      
      const command = commands.get(cmdName) || [...commands.values()].find(c => c.alias?.includes(cmdName) || c.aliases?.includes(cmdName))

      if (!command) {
        if (db.get('confirmMsg')) {
          logger.warn('ROUTER', `Unknown command: ${cmdName}`, { from })
        }
        return
      }

      // PERMISSION CHECK
      const senderNum = sender.split('@')[0]
      const isOwner = senderNum === db.get('owner') || m.key.fromMe
      const isSudo = db.isSudo(senderNum) || isOwner

      if (db.get('mode') === 'private' && !isSudo) return
      if (command.isOwner && !isOwner) return
      if (command.isSudo && !isSudo) return

      try {
        await command.execute(sock, m, args, db, {
          isOwner,
          isSudo,
          sender,
          senderNum,
          pushName,
          body,
          chatType: jidType
        })
        logger.executed(cmdName, pushName, true)
      } catch (err) {
        logger.executed(cmdName, pushName, false)
        logger.error('ROUTER', `Execution error in ${cmdName}`, err.message)
      }
    }

  } catch (e) {
    logger.error('ROUTER', `Fatal routing error: ${e.message}`)
  }
}

export async function routeEvent(sock, event, data) {
  // Event routing logic here if needed
}