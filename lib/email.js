import nodemailer from "nodemailer";

const USER = process.env.GMAIL_USER;
const PASS = (process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, "");
const FROM = process.env.EMAIL_FROM || (USER ? `Fourchettator <${USER}>` : "Fourchettator");

export function appUrl() {
  return (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

let _t = null;
function transport() {
  if (_t) return _t;
  if (!USER || !PASS) return null;
  _t = nodemailer.createTransport({ service: "gmail", auth: { user: USER, pass: PASS } });
  return _t;
}

export async function sendEmail({ to, subject, html }) {
  const t = transport();
  if (!t) {
    console.log(`\n──────── EMAIL (dev, non envoyé) ────────\nÀ : ${to}\nObjet : ${subject}\n${html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}\n─────────────────────────────────────────\n`);
    return { ok: true, dev: true };
  }
  try {
    await t.sendMail({ from: FROM, to, subject, html });
    return { ok: true };
  } catch (e) {
    console.error("Gmail SMTP:", e);
    return { ok: false };
  }
}

function shell(title, body, btnLabel, btnUrl) {
  return `
  <div style="font-family:system-ui,sans-serif;max-width:480px;margin:auto;padding:24px;color:#241c13">
    <h1 style="font-size:22px">${title}</h1>
    <p style="font-size:15px;line-height:1.5;color:#4a4036">${body}</p>
    <p style="margin:28px 0">
      <a href="${btnUrl}" style="background:#d8432c;color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:10px;display:inline-block">${btnLabel}</a>
    </p>
    <p style="font-size:12px;color:#8a7f72">Ou copie ce lien dans ton navigateur :<br>${btnUrl}</p>
    <p style="font-size:12px;color:#8a7f72;margin-top:24px">Si tu n'es pas à l'origine de cette demande, ignore cet email.</p>
  </div>`;
}

export function sendVerificationEmail(to, token) {
  const url = `${appUrl()}/verifier-email?token=${token}`;
  return sendEmail({
    to,
    subject: "Fourchettator - Confirme ton adresse",
    html: shell("Bienvenue chez Fourchettator 🍲", "Confirme ton adresse email pour activer ton compte.", "Confirmer mon email", url),
  });
}

export function sendDeletionEmail(to, token) {
  const url = `${appUrl()}/supprimer-compte?token=${token}`;
  return sendEmail({
    to,
    subject: "Fourchettator - Confirme la suppression de ton compte",
    html: shell("Suppression de compte", "Tu as demandé la suppression de ton compte. Cette action est <b>irréversible</b> et efface ton profil et tes favoris.", "Confirmer la suppression", url),
  });
}

export function sendPasswordChangedEmail(to, token) {
  const url = `${appUrl()}/securiser-compte?token=${token}`;
  return sendEmail({
    to,
    subject: "Fourchettator - Ton mot de passe a été modifié",
    html: shell(
      "Mot de passe modifié",
      "Le mot de passe de ton compte vient d'être changé. <b>Si c'est bien toi, tu peux ignorer cet email.</b><br><br>Si ce n'est PAS toi, sécurise ton compte tout de suite : le bouton ci-dessous définit un nouveau mot de passe et déconnecte tous les appareils.",
      "Ce n'était pas moi, sécuriser mon compte",
      url
    ),
  });
}

export function sendPromoEmail(to, subject, message, unsubUrl) {
  const body = String(message)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
  const html = `
  <div style="font-family:system-ui,sans-serif;max-width:520px;margin:auto;padding:24px;color:#241c13">
    <div style="font-size:15px;line-height:1.6">${body}</div>
    <hr style="border:none;border-top:1px solid #e3d9c6;margin:28px 0">
    <p style="font-size:12px;color:#8a7f72">Tu reçois cet email car tu as un compte Fourchettator. <a href="${unsubUrl}" style="color:#8a7f72">Se désabonner</a>.</p>
  </div>`;
  return sendEmail({ to, subject, html });
}
