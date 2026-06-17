export default {
  name: 'alive',
  category: 'general',
  execute: async (m, sock, db) => {
    const caption = `╭❖『 🤖 SBG STATUS 』
│
├❖ *Bot:* SBG (Small But Genius)
├❖ *Status:* Active & Running 🚀
├❖ *Uptime:* Stable
├❖ *Database:* ${db.type}
├⊸ *Version:* 1.0.0
│
╰❖ *SBG Online* 🧠`
    await sock.sendMessage(m.jid, { text: caption })
  }
}
