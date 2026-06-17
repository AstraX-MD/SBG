export default {
  name: 'menu',
  category: 'general',
  execute: async (m, sock) => {
    const menuText = `╭❖『 📜 SBG MENU 』
│
├❖ .alive - Check bot status
├❖ .ping - Test bot speed
├❖ .menu - Show this list
│
╰❖ *SBG Commands* 🧩`
    await sock.sendMessage(m.jid, { text: menuText })
  }
}
