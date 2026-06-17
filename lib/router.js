// Global stats tracker
global.cmdStats = global.cmdStats || { today: 0, total: 0, commands: {} }

export async function routeMessage(sock, m, db) {
  try {
    const from = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid
    
    // CONTEXT EXTRACTION
    const message = m.message
    const msgType = Object.keys(message || {})[0] || 'unknown'
    const body = message?.conversation || 
                 message?.extendedTextMessage?.text || 
                 message?.imageMessage?.caption || 
                 message?.videoMessage?.caption || 
                 message?.documentMessage?.caption || ''

    if (!body.startsWith(db.data.prefix)) return

    const args = body.slice(db.data.prefix.length).trim().split(/ +/)
    const commandName = args.shift().toLowerCase()

    const pushName = m.pushName || sender.split('@')[0]
    let chatType = 'DM'
    if (from.endsWith('@g.us')) chatType = 'GROUP'
    else if (from.endsWith('@newsletter')) chatType = 'CHANNEL'
    else if (from === 'status@broadcast') chatType = 'STATUS'

    logger.cmd('ROUTER', `${commandName} triggered by ${pushName}`, { from, chatType })

    const handler = global.commands.get(commandName)
    
    // Command Not Found
    if (!handler) {
      logger.warn('ROUTER', `Unknown command: ${commandName}`, { from })
      const helpBox = `╭─⌈ 📊 *${db.data.botname}* ⌋\n├─⊷ *Command:* ${commandName}\n├─⊷ *Status:* Not Found\n├─⊷ Use *${db.data.prefix}menu*\n╰⊷`
      await sock.sendMessage(from, { text: helpBox })
      return
    }

    // TARGET EXTRACTION WITH FALLBACKS
    let target = null
    let targetName = 'Unknown'
    const contextInfo = message?.extendedTextMessage?.contextInfo || 
                        message?.[msgType]?.contextInfo

    // Mode 1: Reply to message
    if (contextInfo?.participant) {
      target = contextInfo.participant
      targetName = target.split('@')[0]
    }
    // Mode 2: Tag someone
    else if (contextInfo?.mentionedJid?.length > 0) {
      target = contextInfo.mentionedJid[0]
      targetName = target.split('@')[0]
    }
    // Mode 3: Direct number
    else if (args[0]?.match(/^\d+$/)) {
      target = args[0] + '@s.whatsapp.net'
      targetName = args[0]
    }

    // Permission Check
    const isOwner = sender.split(':')[0].split('@')[0] === db.data.owner?.split(':')[0].split('@')[0] || m.key.fromMe
    const isSudo = db.isSudo(sender.split('@')[0]) || isOwner

    if (handler.isOwner && !isOwner) return
    if (handler.isSudo && !isSudo) return

    // Mode Filtering
    if (db.data.mode === 'private' && !isSudo) {
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
        body,
        target,
        targetName
      })
      
      // Update stats
      global.cmdStats.today++
      global.cmdStats.total++
      global.cmdStats.commands[commandName] = (global.cmdStats.commands[commandName] || 0) + 1
      logger.executed(commandName, pushName, true)
    } catch (e) {
      logger.executed(commandName, pushName, false)
      logger.error('ROUTER', `Command ${commandName} failed`, e.message)
      
      let errorMsg = '❌ Unknown error'
      if (e.message.includes('404')) errorMsg = '❌ Person not found'
      else if (e.message.includes('403')) errorMsg = '❌ Cannot perform action'
      else if (e.message.includes('401')) errorMsg = '❌ Bot lacks permission'

      const errorBox = `╭❖『 ❌ ERROR 』\n│\n├❖ *Command:* ${commandName}\n├❖ *Status:* Failed\n├⊸ *Reason:* ${errorMsg}\n│\n╰❖ *${db.data.botname}* 🦚`
      await sock.sendMessage(from, { text: errorBox })
    }

  } catch (e) {
    logger.error('ROUTER', `Fatal routing error: ${e.message}`)
  }
}