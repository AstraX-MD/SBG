// Global stats tracker
global.cmdStats = global.cmdStats || { today: 0, total: 0, commands: {} }

export async function routeMessage(sock, m, db) {
  try {
    const from = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid
    const body = m.message?.conversation || m.message?.extendedTextMessage?.text || m.message?.imageMessage?.caption || m.message?.videoMessage?.caption || ''
    
    if (!body.startsWith(db.data.prefix)) return
    
    const args = body.slice(db.data.prefix.length).trim().split(/ +/)
    const command = args.shift().toLowerCase()

    let chatType = 'DM'
    if (from.endsWith('@g.us')) chatType = 'GROUP'
    else if (from.endsWith('@newsletter')) chatType = 'CHANNEL'
    else if (from === 'status@broadcast') chatType = 'STATUS'

    logger.cmd('ROUTER', `${command} triggered by ${sender.split('@')[0]}`, { from, chatType })

    const handler = global.commands.get(command)
    if (!handler) {
      logger.warn('ROUTER', `Unknown command: ${command}`, { from, sender: sender.split('@')[0] })
      return
    }

    // Permission Check
    const isOwner = sender.split(':')[0].split('@')[0] === db.data.owner?.split(':')[0].split('@')[0] || m.key.fromMe
    const isSudo = db.isSudo(sender.split('@')[0]) || isOwner

    if (handler.isOwner && !isOwner) return
    if (handler.isSudo && !isSudo) return

    try {
      await handler.execute(sock, m, args, db, {
        isOwner,
        isSudo,
        sender,
        senderNum: sender.split('@')[0],
        pushName: m.pushName,
        body
      })
      
      // Update stats
      global.cmdStats.today++
      global.cmdStats.total++
      global.cmdStats.commands[command] = (global.cmdStats.commands[command] || 0) + 1
      logger.executed(command, sender.split('@')[0], true)
    } catch (e) {
      logger.executed(command, sender.split('@')[0], false)
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
