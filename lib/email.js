// Envoi d'emails via Gmail (SMTP / nodemailer).
// Nécessite un MOT DE PASSE D'APPLICATION Google (pas le mot de passe habituel) :
//   GMAIL_USER=ton.adresse@gmail.com
//   GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx   (16 caractères, généré dans le compte Google)
// Sans ces variables, les emails s'affichent dans la console (pratique en dev).
import nodemailer from "nodemailer";

const USER = process.env.GMAIL_USER;
const PASS = (process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, ""); // tolère les espaces du mot de passe d'app
const FROM = process.env.EMAIL_FROM || (USER ? `Fourchettator <${USER}>` : "Fourchettator");

export function appUrl() {
  return (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

// Transport mis en cache (réutilisé entre les requêtes).
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

// Gabarit aux couleurs du site : papier crème, carte bordée + ombre dure,
// bandeau sombre type "ticker" avec un libellé en capitales (au lieu d'emojis),
// titre en serif (Fraunces), texte en sans (Hanken Grotesk), bouton tomate.
function shell({ kicker = "", title, body, btn = null, footer = "" }) {
  const button = btn
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 4px">
         <tr><td style="border-radius:10px;background:#d8432c;border:2px solid #241c13;box-shadow:3px 3px 0 #241c13">
           <a href="${btn.url}" style="display:inline-block;padding:12px 24px;font-family:'Hanken Grotesk',Helvetica,Arial,sans-serif;font-size:14px;font-weight:700;color:#fffbf2;text-decoration:none">${btn.label}</a>
         </td></tr>
       </table>
       <p style="margin:10px 0 0;font-family:'Hanken Grotesk',Helvetica,Arial,sans-serif;font-size:12px;line-height:1.5;color:#8c7c66;word-break:break-all">Ou copie ce lien dans ton navigateur&nbsp;:<br><span style="color:#566a2c">${btn.url}</span></p>`
    : "";
  const foot = footer || "Si tu n'es pas à l'origine de cette demande, tu peux ignorer cet email en toute sécurité.";
  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,900&family=Hanken+Grotesk:wght@400;700&display=swap" rel="stylesheet"></head>
<body style="margin:0;padding:0;background:#f5edde">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5edde"><tr><td align="center" style="padding:32px 16px">
  <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="width:480px;max-width:100%;background:#fffbf2;border:2px solid #241c13;border-radius:14px;box-shadow:5px 5px 0 #241c13;overflow:hidden">
    <tr><td style="background:#241c13;padding:13px 24px">
      <span style="font-family:'Hanken Grotesk',Arial,sans-serif;color:#f5edde;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase">Fourchettator</span>${kicker ? `<span style="color:#e7a23a;font-size:11px;margin:0 8px">&bull;</span><span style="font-family:'Hanken Grotesk',Arial,sans-serif;color:#cdbfa6;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase">${kicker}</span>` : ""}
    </td></tr>
    <tr><td style="padding:30px 26px 6px">
      <h1 style="margin:0 0 12px;font-family:'Fraunces',Georgia,serif;font-weight:900;font-size:25px;line-height:1.15;color:#241c13">${title}</h1>
      <div style="font-family:'Hanken Grotesk',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#3c2f20">${body}</div>
      ${button}
    </td></tr>
    <tr><td style="padding:18px 26px 24px"><div style="border-top:1px solid #e6dac2;padding-top:16px;font-family:'Hanken Grotesk',Helvetica,Arial,sans-serif;font-size:12px;line-height:1.55;color:#8c7c66">${foot}</div></td></tr>
  </table>
  <p style="margin:14px 0 0;font-family:'Hanken Grotesk',Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#b6a98f">Fourchettator — la cuisine maison, sans chichi</p>
</td></tr></table>
</body></html>`;
}

export function sendVerificationEmail(to, token) {
  const url = `${appUrl()}/verifier-email?token=${token}`;
  return sendEmail({
    to,
    subject: "Confirme ton adresse — Fourchettator",
    html: shell({
      kicker: "Bienvenue",
      title: "Confirme ton adresse",
      body: `<p style="margin:0">Encore une étape&nbsp;: confirme ton adresse email pour activer ton compte et commencer à mijoter.</p>`,
      btn: { label: "Confirmer mon adresse", url },
    }),
  });
}

export function sendDeletionEmail(to, token) {
  const url = `${appUrl()}/supprimer-compte?token=${token}`;
  return sendEmail({
    to,
    subject: "Confirme la suppression de ton compte — Fourchettator",
    html: shell({
      kicker: "Suppression de compte",
      title: "Confirmer la suppression",
      body: `<p style="margin:0">Tu as demandé la suppression de ton compte. Cette action est <b>définitive</b> et efface ton profil ainsi que tous tes favoris.</p>`,
      btn: { label: "Supprimer définitivement", url },
      footer: "Tu n'as rien demandé&nbsp;? Ignore simplement cet email, ton compte restera intact.",
    }),
  });
}

export function sendPasswordChangedEmail(to, token) {
  const url = `${appUrl()}/securiser-compte?token=${token}`;
  return sendEmail({
    to,
    subject: "Ton mot de passe a été modifié — Fourchettator",
    html: shell({
      kicker: "Sécurité du compte",
      title: "Mot de passe modifié",
      body: `<p style="margin:0 0 12px">Le mot de passe de ton compte vient d'être changé. Si c'est bien toi, tout est en ordre&nbsp;: tu peux ignorer cet email.</p><p style="margin:0">Si ce <b>n'est pas toi</b>, sécurise ton compte sans attendre. Le bouton ci-dessous définit un nouveau mot de passe et déconnecte tous les appareils.</p>`,
      btn: { label: "Ce n'était pas moi - sécuriser", url },
      footer: "Par sécurité, ce lien remplace le mot de passe et invalide les autres sessions.",
    }),
  });
}

// Email promotionnel : le corps (texte) est échappé et un pied de désabonnement est ajouté.
export function sendPromoEmail(to, subject, message, unsubUrl) {
  const body = String(message)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
  return sendEmail({
    to,
    subject,
    html: shell({
      kicker: "Newsletter",
      title: subject,
      body: `<div style="font-size:15px;line-height:1.65">${body}</div>`,
      footer: `Tu reçois cet email car tu as un compte Fourchettator. <a href="${unsubUrl}" style="color:#566a2c;font-weight:700">Se désabonner</a>.`,
    }),
  });
}
