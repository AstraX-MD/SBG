// Global stats tracker
global.cmdStats = global.cmdStats || { today: 0, total: 0, commands: {} }

export async function routeMessage(sock, m, db) {
  try {
    const from = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid
    
    // FALLBACK CONTEXT EXTRACTION
    const { 
      message = null, 
      msgType = 'unknown', 
      body = '', 
      cmd = null, 
      chatType = 'DM', 
      isViewOnce = false, 
      isBot = false, 
      pushName = 'User' 
    } = m.extracted || {}

    if (!cmd) return

    const args = body.slice(db.data.prefix.length).trim().split(/ +/)
    const commandName = args.shift().toLowerCase()

    logger.cmd('ROUTER', `${commandName} triggered by ${pushName}`, { from, chatType })

    const handler = global.commands.get(commandName)
    
    // FALLBACK: Command Not Found
    if (!handler) {
      logger.warn('ROUTER', `Unknown command: ${commandName}`, { from })
      const helpBox = `╭─⌈ 📊 *${db.data.botname}* ⌋\n├─⊷ *Command:* ${commandName}\n├─⊷ *Status:* Not Found\n├─⊷ Use *${db.data.prefix}menu*\n╰⊷`
      await sock.sendMessage(from, { text: helpBox })
      return
    }

    // Permission Check
    const isOwner = sender.split(':')[0].split('@')[0] === db.data.owner?.split(':')[0].split('@')[0] || m.key.fromMe || isBot
    const isSudo = db.isSudo(sender.split('@')[0]) || isOwner

    if (handler.isOwner && !isOwner) return
    if (handler.isSudo && !isSudo) return

    // Mode Filtering
    if (db.data.mode === 'private' && !isSudo && !isBot) {
      logger.debug('MODE', `Blocked ${commandName} in private mode`, { from, sender: pushName })
      return
    }

    try {
      await handler.execute(sock, m, args, db, {
        isOwner,
        isSudo,
        sender,
        senderNum: sender.split('@')[0],
        pushName,
        body
      })
      
      // Update stats
      global.cmdStats.today++
      global.cmdStats.total++
      global.cmdStats.commands[commandName] = (global.cmdStats.commands[commandName] || 0) + 1
      logger.executed(commandName, pushName, true)
    } catch (e) {
      logger.executed(commandName, pushName, false)
      logger.error('ROUTER', `Command ${commandName} failed`, e.message)
      
      // Error Box Response
      const errorBox = `╭❖『 ❌ ERROR 』\n│\n├❖ *Command:* ${commandName}\n├❖ *Status:* Failed\n├⊸ *Reason:* ${e.message}\n│\n╰❖ *${db.data.botname}* 🦚`
      await sock.sendMessage(from, { text: errorBox })
    }

  } catch (e) {
    logger.error('ROUTER', `Fatal routing error: ${e.message}`)
  }
}
