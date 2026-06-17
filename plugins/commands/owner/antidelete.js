export default {
  name: 'antidelete',
  alias: ['ad', 'recovery'],
  category: 'owner',
  emoji: '🚨',
  desc: 'Manage anti-delete settings',
  isOwner: true,
  async execute(sock, m, args, db) {
    const from = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid
    const isSudo = db.isSudo(sender.split('@')[0])

    logger.cmd('ANTIDELETE', 'Command triggered', { from, sender: sender.split('@')[0], args })

    if (!isSudo) {
      logger.warn('ANTIDELETE', 'Unauthorized', { from })
      return
    }

    db.data.antidelete = db.data.antidelete || {
      enabled: true,
      mode: 'private',
      destination: db.data.owner,
      disabledChats: [],
      disabledTypes: [],
      disabledUsers: [],
      logDeletes: true,
      maxFileSize: 100,
      antiSpam: true
    }

    const action = args[0]?.toLowerCase()
    const target = args[1]

    try {
      if (action === 'on') {
        db.data.antidelete.enabled = true
        db.data.antidelete.mode = 'private'
        await db.write()
        logger.success('ANTIDELETE', 'Enabled private mode', {})
        const box = `╭─⌈ 📊 *ANTIDELETE* ⌋\n├─⊷ *Mode:* ON (*current*)\n├─⊷ *${db.data.prefix}antidelete on*\n│ └⊷ Enable (private mode)\n├─⊷ *${db.data.prefix}antidelete off*\n│ └⊷ Disable antidelete\n├─⊷ *${db.data.prefix}antidelete public*\n│ └⊷ Show in chat\n╰⊷`
        await sock.sendMessage(from, { text: box })
      }

      else if (action === 'off') {
        db.data.antidelete.enabled = false
        await db.write()
        logger.success('ANTIDELETE', 'Disabled', {})
        const box = `╭─⌈ 📊 *ANTIDELETE* ⌋\n├─⊷ *Mode:* OFF (*current*)\n├─⊷ *${db.data.prefix}antidelete on*\n│ └⊷ Enable (private mode)\n├─⊷ *${db.data.prefix}antidelete off*\n│ └⊷ Disable antidelete\n├─⊷ *${db.data.prefix}antidelete public*\n│ └⊷ Show in chat\n╰⊷`
        await sock.sendMessage(from, { text: box })
      }

      else if (action === 'public') {
        db.data.antidelete.enabled = true
        db.data.antidelete.mode = 'public'
        await db.write()
        logger.success('ANTIDELETE', 'Enabled public mode', {})
        const box = `╭─⌈ 📊 *ANTIDELETE* ⌋\n├─⊷ *Mode:* PUBLIC (*current*)\n├─⊷ *${db.data.prefix}antidelete on*\n│ └⊷ Enable (private mode)\n├─⊷ *${db.data.prefix}antidelete off*\n│ └⊷ Disable antidelete\n├─⊷ *${db.data.prefix}antidelete public*\n│ └⊷ Show in chat\n╰⊷`
        await sock.sendMessage(from, { text: box })
      }

      else if (action === 'status') {
        const mode = db.data.antidelete.enabled ? (db.data.antidelete.mode === 'public' ? 'PUBLIC' : 'ON') : 'OFF'
        const dest = db.data.antidelete.destination.split('@')[0]
        const disabledCount = db.data.antidelete.disabledChats.length
        const disabledTypes = db.data.antidelete.disabledTypes.join(', ') || 'None'
        const disabledUsers = db.data.antidelete.disabledUsers.length
        const maxSize = db.data.antidelete.maxFileSize === 0 ? 'Unlimited' : `${db.data.antidelete.maxFileSize}MB`
        const box = `╭─⌈ 📊 *ANTIDELETE STATUS* ⌋\n├─⊷ *Mode:* ${mode}\n├─⊷ *Destination:* ${dest}\n├─⊷ *Max Size:* ${maxSize}\n├─⊷ *Anti-Spam:* ${db.data.antidelete.antiSpam ? 'ON' : 'OFF'}\n├─⊷ *Disabled Chats:* ${disabledCount}\n├─⊷ *Disabled Types:* ${disabledTypes}\n├─⊷ *Whitelisted Users:* ${disabledUsers}\n├─⊷ *${db.data.prefix}antidelete on/off/public*\n│ └⊷ Change mode\n╰⊷`
        await sock.sendMessage(from, { text: box })
      }

      else if (action === 'disable') {
        if (['group', 'channel', 'status', 'dm'].includes(target)) {
          if (!db.data.antidelete.disabledTypes.includes(target)) {
            db.data.antidelete.disabledTypes.push(target)
            await db.write()
            logger.success('ANTIDELETE', `Disabled type: ${target}`, {})
          }
        } else if (target?.includes('@')) {
          if (!db.data.antidelete.disabledChats.includes(target)) {
            db.data.antidelete.disabledChats.push(target)
            await db.write()
            logger.success('ANTIDELETE', `Disabled chat: ${target}`, {})
          }
        } else if (target?.match(/^\d+$/)) {
          const userJid = target + '@s.whatsapp.net'
          if (!db.data.antidelete.disabledUsers.includes(userJid)) {
            db.data.antidelete.disabledUsers.push(userJid)
            await db.write()
            logger.success('ANTIDELETE', `Whitelisted user: ${target}`, {})
          }
        }
        await sock.sendMessage(from, { text: `✅ Disabled: ${target}` })
      }

      else if (action === 'enable') {
        if (['group', 'channel', 'status', 'dm'].includes(target)) {
          db.data.antidelete.disabledTypes = db.data.antidelete.disabledTypes.filter(t => t !== target)
          await db.write()
          logger.success('ANTIDELETE', `Enabled type: ${target}`, {})
        } else if (target?.includes('@')) {
          db.data.antidelete.disabledChats = db.data.antidelete.disabledChats.filter(c => c !== target)
          await db.write()
          logger.success('ANTIDELETE', `Enabled chat: ${target}`, {})
        } else if (target?.match(/^\d+$/)) {
          const userJid = target + '@s.whatsapp.net'
          db.data.antidelete.disabledUsers = db.data.antidelete.disabledUsers.filter(u => u !== userJid)
          await db.write()
          logger.success('ANTIDELETE', `Unwhitelisted user: ${target}`, {})
        }
        await sock.sendMessage(from, { text: `✅ Enabled: ${target}` })
      }

      else if (action === 'destination') {
        if (target && target.match(/^\d+$/)) {
          db.data.antidelete.destination = target + '@s.whatsapp.net'
          await db.write()
          logger.success('ANTIDELETE', `Destination: ${target}`, {})
          await sock.sendMessage(from, { text: `✅ Destination: ${target}` })
        }
      }

      else {
        const currentMode = db.data.antidelete.enabled ? (db.data.antidelete.mode === 'public' ? 'PUBLIC' : 'ON') : 'OFF'
        const box = `╭─⌈ 📊 *ANTIDELETE* ⌋\n├─⊷ *Mode:* ${currentMode} (*current*)\n├─⊷ *${db.data.prefix}antidelete on*\n│ └⊷ Enable (private mode)\n├─⊷ *${db.data.prefix}antidelete off*\n│ └⊷ Disable antidelete\n├─⊷ *${db.data.prefix}antidelete public*\n│ └⊷ Show in chat\n├─⊷ *${db.data.prefix}antidelete status*\n│ └⊷ Show settings\n├─⊷ *${db.data.prefix}antidelete disable group*\n│ └⊷ Disable for groups\n├─⊷ *${db.data.prefix}antidelete disable jid*\n│ └⊷ Disable specific chat\n├─⊷ *${db.data.prefix}antidelete disable number*\n│ └⊷ Whitelist user\n╰⊷`
        await sock.sendMessage(from, { text: box })
      }

    } catch (e) {
      logger.error('ANTIDELETE', 'Command failed', e.message)
    }
  }
}