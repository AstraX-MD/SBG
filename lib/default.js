export default {
  botname: 'SBG',
  presents: 'PRESENTS',
  prefix: '.',
  owner: '',
  sudo: [],
  mode: 'public',
  firstConnect: false,
  noprefix: false, // false = prefix required, true = no prefix needed, both work
  reactCmd: true,
  confirmMsg: true,
  antiDelete: false,
  autoRead: false,
  statusView: false,
  antiViewOnce: false,
  platform: 'Render',
  botThumbnail: 'https://i.ibb.co/0pymBf8T/file-000000002ee471f4a0c0930a2621f19a.png',
  groqKey: process.env.GROQ_API_KEY || ''
}
