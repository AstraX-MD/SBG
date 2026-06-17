import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'
import makeWASocket, { 
  useMultiFileAuthState, 
  DisconnectReason, 
  Browsers, 
  fetchLatestBaileysVersion 
} from '@whiskeysockets/baileys'
import pino from 'pino'
import fs from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import db from './lib/database.js'
import { logger } from './lib/logger.js'
import { loadPlugins } from './lib/loader.js'
import { router } from './lib/router.js'
import aliveHtml from './public/alive.html.js'
import statusHtml from './public/status.html.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const server = createServer(app)
const PORT = process.env.PORT || 3000

app.use(express.static(join(__dirname, 'public')))
app.use(express.json())

app.get('/', (req, res) => res.send(aliveHtml))
app.get('/status', (req, res) => res.send(statusHtml(db.data)))

function loadSessionFromEnv() {
  const sessionId = process.env.SESSION_ID
  if (!sessionId || !sessionId.includes('~')) {
    logger.error('SESSION', 'No SESSION_ID found in env or invalid format')
    return false
  }
  try {
    const SESSION_DIR = db.data.sessionPath || './sbg_session'
    if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true })
    const base64Data = sessionId.split('~')[1]
    const decoded = Buffer.from(base64Data, 'base64').toString('utf-8')
    const creds = JSON.parse(decoded)
    fs.writeFileSync(join(SESSION_DIR, 'creds.json'), JSON.stringify(creds, null, 2))
    logger.success('SESSION', `Session loaded from ${sessionId.split('~')[0]}~ prefix`)
    return true
  } catch (e) {
    logger.error('SESSION', 'Failed to decode SESSION_ID', e.message)
    return false
  }
}

async function startBot() {
  logger.bot('STARTUP', 'Starting SBG Bot...')
  
  // Dynamic Platform Detection
  let platform = 'Katabump/Pterodactyl'
  if (process.env.RENDER) platform = 'Render'
  else if (process.env.RAILWAY_ENVIRONMENT) platform = 'Railway'
  else if (process.env.DYNO) platform = 'Heroku'
  else if (process.env.FLY_APP_NAME) platform = 'Fly'
  else if (process.env.FIREBASE_CONFIG) platform = 'Firebase'
  
  db.data.platform = platform
  await db.write()
  
  logger.success('DB', `Database mode: ${db.type} | Platform: ${platform}`)

  const SESSION_DIR = db.data.sessionPath || './sbg_session'
  const CREDS_PATH = join(SESSION_DIR, 'creds.json')

  if (!fs.existsSync(CREDS_PATH)) {
    if (!loadSessionFromEnv()) {
      logger.error('STARTUP', 'No session found. Waiting for QR (if enabled) or exit.')
      // In this setup we strictly require SESSION_ID per prompt
      process.exit(1)
    }
  }

  await loadPlugins()
  const { version } = await fetchLatestBaileysVersion()
  logger.info('BAILEYS', `Using WA v${version.join('.')}`)

  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR)

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: 'silent' }),
    browser: Browsers.ubuntu('Chrome'),
    markOnlineOnConnect: false,
    syncFullHistory: false,
    generateHighQualityLinkPreview: false,
    defaultQueryTimeoutMs: 60000,
    keepAliveIntervalMs: 10000,
    getMessage: async () => ({ conversation: '' })
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut
      logger.error('CONNECTION', `Closed: ${statusCode}`, lastDisconnect?.error?.message)
      if (shouldReconnect) {
        logger.warn('CONNECTION', 'Reconnecting in 10s...')
        setTimeout(() => startBot(), 10000)
      } else {
        logger.error('CONNECTION', 'Logged out. Delete session directory and re-pair.')
        process.exit(1)
      }
    } else if (connection === 'open') {
      const botNumber = sock.user.id.split(':')[0].split('@')[0]
      if (!db.data.owner || db.data.owner === '') {
        db.data.owner = botNumber
        await db.write()
        logger.success('OWNER', `Owner auto-set to: ${botNumber}`)
      }

      const { botname, prefix, owner } = db.data

      logger.connected(sock.user.id, botname)
      logger.banner(botname, prefix, owner, db.type, version.join('.'))

      if (!db.data.firstConnect) {
        await sendConnectedMsg(sock)
        db.data.firstConnect = true
        await db.write()
      }
    }
  })

  sock.ev.on('messages.upsert', async (m) => {
    if (m.type !== 'notify') return
    for (const msg of m.messages) {
      if (!msg.message) continue
      
      const from = msg.key.remoteJid
      const sender = msg.key.participant || msg.key.remoteJid
      const msgType = Object.keys(msg.message || {})[0]
      
      let body = ''
      if (msgType === 'conversation') body = msg.message.conversation
      else if (msgType === 'extendedTextMessage') body = msg.message.extendedTextMessage.text
      else if (msgType === 'imageMessage') body = msg.message.imageMessage.caption
      else if (msgType === 'videoMessage') body = msg.message.videoMessage.caption
      
      const cmd = body.startsWith(db.data.prefix) ? body.split(' ')[0] : (db.data.noprefix ? body.split(' ')[0] : null)

      let chatType = 'DM'
      if (from.endsWith('@g.us')) chatType = 'GROUP'
      else if (from.endsWith('@newsletter')) chatType = 'CHANNEL'
      else if (from === 'status@broadcast') chatType = 'STATUS'

      const msgLabel = `${chatType} ${msgType?.toUpperCase() || 'UNKNOWN'}`
      logger.incoming(from, sender.split('@')[0], cmd || msgLabel)

      await router(msg, sock, db)
    }
  })
}

async function sendConnectedMsg(sock) {
  try {
    const owner = db.data.owner
    const ownerJid = `${owner}@s.whatsapp.net`
    const msg = `╭❖『 🤖 ${db.data.botname} CONNECTED 』
│
├❖ *To:* @${owner}
├❖ *Bot:* ${db.data.botname}
├❖ *Prefix:* ${db.data.prefix}
├❖ *Mode:* ${db.data.mode}
├❖ *Platform:* ${db.data.platform}
├❖ *Status:* ✅ Online
├⊸ *Session:* Valid & Secure
│
╰❖ *${db.data.botname} ${db.data.presents}* 🦚`
    await sock.sendMessage(ownerJid, { text: msg, mentions: [ownerJid] })
    logger.success('BOT', 'Connected message sent to owner')
  } catch (e) {
    logger.error('BOT', 'Failed to send connected msg', e.message)
  }
}

server.listen(PORT, () => {
  logger.success('SERVER', `Port ${PORT} opened for ${db.data.platform || 'Host'}`)
  startBot()
})