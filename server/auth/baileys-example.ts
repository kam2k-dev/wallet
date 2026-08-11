/**
 * Contoh Integrasi Baileys Self-Hosted Bot dengan Backend Wallet Spend Analysis
 * 
 * Cara kerja:
 * 1. Bot Baileys mendengarkan pesan masuk dari user.
 * 2. Jika pesan berisi format "LOGIN <6-digit-code>" (misal: "LOGIN 123456"),
 *    bot mengirimkan webhook ke backend: POST http://localhost:3000/api/auth/wa/webhook
 * 3. Backend memvalidasi kode dan menandai sesi web app sebagai 'verified'.
 * 4. Bot membalas pesan user dengan konfirmasi sukses.
 * 
 * Prasyarat:
 * npm install @whiskeysockets/baileys qrcode-terminal
 */

/*
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode-terminal';

const BACKEND_WEBHOOK_URL = process.env.BACKEND_WEBHOOK_URL || 'http://localhost:3000/api/auth/wa/webhook';

async function startBaileysBot() {
  const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      qrcode.generate(qr, { small: true });
    }
    if (connection === 'close') {
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Connection closed due to', lastDisconnect?.error, ', reconnecting:', shouldReconnect);
      if (shouldReconnect) {
        startBaileysBot();
      }
    } else if (connection === 'open') {
      console.log('WhatsApp Bot connected successfully!');
    }
  });

  // Listen to incoming messages
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;

      const from = msg.key.remoteJid; // e.g. "628123456789@s.whatsapp.net"
      const text =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        '';

      // Check if message contains LOGIN code
      const match = text.trim().match(/\b(\d{6})\b/);
      if (match && from) {
        console.log(`Received auth code ${match[1]} from ${from}`);

        try {
          const response = await fetch(BACKEND_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from,
              text,
            }),
          });

          const result = await response.json();

          if (result.success) {
            await sock.sendMessage(from, {
              text: '✅ *Login Berhasil!*\n\nSesi login Anda di web app telah diverifikasi. Anda sekarang dapat melanjutkan di browser.',
            });
          } else {
            await sock.sendMessage(from, {
              text: `❌ *Login Gagal*\n\n${result.error || 'Kode verifikasi tidak valid atau telah kedaluwarsa.'}`,
            });
          }
        } catch (err) {
          console.error('Failed to call backend webhook:', err);
        }
      }
    }
  });
}

// startBaileysBot();
*/
