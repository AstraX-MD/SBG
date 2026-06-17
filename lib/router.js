// Global stats tracker
global.cmdStats = global.cmdStats || { today: 0, total: 0, commands: {} }

export async function routeMessage(sock, m, db) {
  try {
    const from = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid
    const { message, msgType, body, cmd, chatType, isViewOnce, isBot, pushName } = m.extracted

    const args = body.slice(db.data.prefix.length).trim().split(/ +/)
    const command = args.shift().toLowerCase()

    logger.cmd('ROUTER', `${command} triggered by ${pushName}`, {
      from,
      chatType,
      isBot,
      isViewOnce,
      msgType
    })

    const handler = global.commands.get(command)
    if (!handler) {
      logger.warn('ROUTER', `Unknown command: ${command}`, { from, sender: pushName })
      return
    }

    // Permission Check
    const isOwner = sender.split(':')[0].split('@')[0] === db.data.owner?.split(':')[0].split('@')[0] || m.key.fromMe || isBot
    const isSudo = db.isSudo(sender.split('@')[0]) || isOwner

    if (handler.isOwner && !isOwner) return
    if (handler.isSudo && !isSudo) return

    // Mode Filtering
    if (db.data.mode === 'private' && !isSudo && !isBot) {
      logger.debug('MODE', `Blocked ${command} in private mode`, { from, sender: pushName })
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
      global.cmdStats.commands[command] = (global.cmdStats.commands[command] || 0) + 1
      logger.executed(command, pushName, true)
    } catch (e) {
      logger.executed(command, pushName, false)
      logger.error('ROUTER', `Command ${command} failed`, e.message)
      if (db.data.confirmMsg) {
        await sock.sendMessage(from, {
          text: `╭❖『 ❌ ERROR 』
│
├❖ *System:* Failed
├⊸ *Try Again*
│
╰❖ *${db.data.botname}* 🦚`
        })
      }
    }

  } catch (e) {
    logger.error('ROUTER', `Error in routeMessage: ${e.message}`)
  }
}