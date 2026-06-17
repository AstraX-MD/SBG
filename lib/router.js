export async function router(context, sock, db) {
  const { body, sender, jid, fromMe } = context
  if (!body) return

  const prefix = db.get('prefix') || '.'
  if (!body.startsWith(prefix)) return

  const args = body.slice(prefix.length).trim().split(/ +/)
  const cmdName = args.shift().toLowerCase()
  const command = global.commands.get(cmdName)

  if (!command) return

  // Mode check
  const owner = db.get('owner')
  const isOwner = fromMe || (owner && sender.split('@')[0] === owner)
  if (db.get('mode') === 'private' && !isOwner) return

  try {
    await command.execute(sock, context.msg, args, db.data)
  } catch (err) {
    const errorText = `╭❖『 ❌ ERROR 』
│
├❖ *Cmd:* ${cmdName}
├❖ *Info:* Failed
│
╰❖ *${db.get('botname')}* 🦚`
    await sock.sendMessage(jid, { text: errorText })
  }
}