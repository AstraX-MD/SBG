export default {
  name: 'mode',
  alias: ['botmode', 'setmode'],
  category: 'owner',
  emoji: '🐰',
  desc: 'Change bot response mode',
  isOwner: true,
  async execute(sock, m, args, db, { isOwner }) {
    try {
      logger.cmd('mode', 'Triggered', { args })
      if (!isOwner) return

      const modes = {
        'public': { name: 'Public', emoji: '🌍' },
        'private': { name: 'Private', emoji: '🔒' },
        'groups': { name: 'Groups', emoji: '👥' },
        'dms': { name: 'DMs', emoji: '📩' },
        'channel': { name: 'Channel', emoji: '📢' },
        'silent': { name: 'Silent', emoji: '🔕' },
        'onlytag': { name: 'OnlyTag', emoji: '🏷️' },
        'onlynum': { name: 'OnlyNum', emoji: '📱' },
        'onlyjid': { name: 'OnlyJID', emoji: '🎯' }
      }

      const newMode = args[0]?.toLowerCase()

      if (!newMode || !modes[newMode]) {
        logger.warn('mode', 'Invalid mode or no mode provided')
        const currentMode = modes[db.data.mode] || { name: 'Unknown', emoji: '❓' }
        let targetInfo = ''
        if (db.data.mode === 'onlytag') targetInfo = `\n├─⊷ *Target:* ${db.data.targetTag}`
        if (db.data.mode === 'onlynum') targetInfo = `\n├─⊷ *Target:* ${db.data.targetNumber}`
        if (db.data.mode === 'onlyjid') targetInfo = `\n├─⊷ *Target:* ${db.data.targetJid}`

        const text = `╭─⌈ 🐰 *BOT MODE* ⌋
│
├─⊷ *${db.data.prefix}mode public*
│ └⊷ Responds to everyone
├─⊷ *${db.data.prefix}mode groups*
│ └⊷ Groups only
├─⊷ *${db.data.prefix}mode dms*
│ └⊷ DMs only
├─⊷ *${db.data.prefix}mode private*
│ └⊷ Owner + Sudo only
├─⊷ *${db.data.prefix}mode channel*
│ └⊷ Channels only
├─⊷ *${db.data.prefix}mode silent*
│ └⊷ Owner only
├─⊷ *${db.data.prefix}mode onlytag @user*
│ └⊷ Only tagged user
├─⊷ *${db.data.prefix}mode onlynum num*
│ └⊷ Only specific number
├─⊷ *${db.data.prefix}mode onlyjid jid*
│ └⊷ Only specific JID
│
├─⊷ *Current:* ${currentMode.emoji} ${currentMode.name}${targetInfo}
│
╰⊷ ${db.data.botname} ${db.data.presents} 🦚`
        
        await sock.sendMessage(m.key.remoteJid, { text })
        return
      }

      if (newMode === 'onlytag') {
        const tag = args[1]
        if (!tag) return sock.sendMessage(m.key.remoteJid, { text: `Usage: ${db.data.prefix}mode onlytag @user` })
        db.data.targetTag = tag
      } else if (newMode === 'onlynum') {
        const num = args[1]?.replace(/[^0-9]/g, '')
        if (!num) return sock.sendMessage(m.key.remoteJid, { text: `Usage: ${db.data.prefix}mode onlynum 255xxx` })
        db.data.targetNumber = num
      } else if (newMode === 'onlyjid') {
        const jid = args[1]
        if (!jid) return sock.sendMessage(m.key.remoteJid, { text: `Usage: ${db.data.prefix}mode onlyjid groupid` })
        db.data.targetJid = jid
      }

      const oldMode = db.data.mode
      db.data.mode = newMode
      await db.write()
      logger.success('mode', `Mode updated from ${oldMode} to ${newMode}`)

      if (db.data.confirmMsg) {
        const modeInfo = modes[newMode]
        const text = `╭─⌈ ${modeInfo.emoji} *MODE UPDATED* ⌋
│
├─⊷ *Mode:* ${modeInfo.name}
├─⊷ *Status:* Active ✅
│
╰⊷ ${db.data.botname} ${db.data.presents} 🦚`
        await sock.sendMessage(m.key.remoteJid, { text })
        logger.success('mode', 'Response sent')
      }
    } catch (e) {
      logger.error('mode', 'Failed', e.message)
      const errorBox = `╭❖『 ❌ ERROR 』\n│\n├❖ *Command:* mode\n├❖ *Status:* Failed\n├⊸ *Reason:* ${e.message}\n│\n╰❖ *${db.data.botname}* 🦚`
      await sock.sendMessage(m.key.remoteJid, { text: errorBox })
    }
  }
}
