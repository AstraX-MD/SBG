export async function router(m, sock, db) {
  if (!m.body) return
  const prefix = db.get('prefix') || '.'
  const isCmd = m.body.startsWith(prefix)
  if (!isCmd) return

  const command = m.body.slice(prefix.length).trim().split(' ')[0].toLowerCase()
  const args = m.body.slice(prefix.length).trim().split(' ').slice(1)

  // Logic to dispatch to loaded plugins
  // For now, this is a placeholder as requested
}
