const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;
  if (!SMTP_HOST || !SMTP_PORT) return null;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === 'true',
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });
  return transporter;
}

function fmt(date) {
  try { return new Date(date).toLocaleString('en-GB'); } catch { return String(date); }
}

function buildHtml(ticket, flight) {
  const fromName = flight.from_city?.city_name || flight.from_city;
  const toName = flight.to_city?.city_name || flight.to_city;
  return `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;border:1px solid #ddd;border-radius:8px;padding:24px;">
    <h2 style="color:#0d6efd;margin-top:0;">FlyTicket E-Ticket</h2>
    <p>Hello <strong>${ticket.passenger_name} ${ticket.passenger_surname}</strong>,</p>
    <p>Your booking is confirmed. Please keep this e-ticket for your records.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Ticket ID</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${ticket.ticket_id}</td></tr>
      <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Flight</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${flight.flight_id}</td></tr>
      <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Route</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${fromName} &rarr; ${toName}</td></tr>
      <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Departure</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${fmt(flight.departure_time)}</td></tr>
      <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Arrival</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${fmt(flight.arrival_time)}</td></tr>
      <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Seat</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${ticket.seat_number}</td></tr>
      <tr><td style="padding:8px;"><strong>Status</strong></td><td style="padding:8px;">${ticket.payment_status}</td></tr>
    </table>
    <p style="color:#666;font-size:12px;">FlyTicket — Have a pleasant flight!</p>
  </div>`;
}

async function sendETicket(ticket, flight) {
  const t = getTransporter();
  if (!t) {
    console.warn('[mail] SMTP not configured; skipping e-ticket email');
    return;
  }
  try {
    await t.sendMail({
      from: process.env.MAIL_FROM || 'no-reply@flyticket.local',
      to: ticket.passenger_email,
      subject: `FlyTicket E-Ticket ${ticket.ticket_id}`,
      html: buildHtml(ticket, flight),
    });
    console.log('[mail] e-ticket sent to', ticket.passenger_email);
  } catch (e) {
    console.error('[mail] send failed:', e.message);
  }
}

module.exports = { sendETicket };
