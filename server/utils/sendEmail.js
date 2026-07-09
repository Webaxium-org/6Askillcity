import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const normalizeRecipients = (email) => {
  if (Array.isArray(email)) {
    return email;
  }

  return String(email)
    .split(",")
    .map((recipient) => recipient.trim())
    .filter(Boolean);
};

const normalizeAttachments = (attachments = []) =>
  attachments.map((attachment) => ({
    filename: attachment.filename,
    content:
      Buffer.isBuffer(attachment.content)
        ? attachment.content.toString("base64")
        : attachment.content,
    contentType: attachment.contentType || attachment.content_type,
  }));

export const sendEmail = async (options) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const email = {
    from: process.env.RESEND_FROM_EMAIL || "6A Skillcity <noreply@6askillcity.com>",
    to: normalizeRecipients(options.email),
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  if (options.attachments?.length) {
    email.attachments = normalizeAttachments(options.attachments);
  }

  const { data, error } = await resend.emails.send(email);

  if (error) {
    throw new Error(`Resend email failed: ${error.message || JSON.stringify(error)}`);
  }

  return data;
};
