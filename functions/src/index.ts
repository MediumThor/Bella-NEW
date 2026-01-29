import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { defineSecret } from "firebase-functions/params";

initializeApp();

type ContactMessage = {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  createdAt?: unknown;
  imageUrls?: string[];
};

function safeText(value: unknown, fallback = ""): string {
  if (typeof value !== "string") return fallback;
  return value.trim();
}

type GraphConfig = {
  tenant_id?: string;
  client_id?: string;
  client_secret?: string;
  from_user?: string; // e.g. ryan@bellastone.net
  notify_to?: string; // e.g. ryan@bellastone.net
};

function getGraphConfig(): Required<GraphConfig> {
  const cfg: GraphConfig = {
    tenant_id: MS_GRAPH_TENANT_ID.value(),
    client_id: MS_GRAPH_CLIENT_ID.value(),
    client_secret: MS_GRAPH_CLIENT_SECRET.value(),
    from_user: MS_GRAPH_FROM_USER.value(),
    notify_to: MS_GRAPH_NOTIFY_TO.value(),
  };

  const required: Array<keyof Required<GraphConfig>> = [
    "tenant_id",
    "client_id",
    "client_secret",
    "from_user",
    "notify_to",
  ];

  for (const k of required) {
    if (!cfg[k] || typeof cfg[k] !== "string" || !cfg[k]!.trim()) {
      throw new Error(`Missing Microsoft Graph secret: ${k}`);
    }
  }

  return {
    tenant_id: cfg.tenant_id!.trim(),
    client_id: cfg.client_id!.trim(),
    client_secret: cfg.client_secret!.trim(),
    from_user: cfg.from_user!.trim(),
    notify_to: cfg.notify_to!.trim(),
  };
}

async function getGraphToken(cfg: Required<GraphConfig>): Promise<string> {
  const tokenUrl = `https://login.microsoftonline.com/${encodeURIComponent(cfg.tenant_id)}/oauth2/v2.0/token`;
  const body = new URLSearchParams();
  body.set("client_id", cfg.client_id);
  body.set("client_secret", cfg.client_secret);
  body.set("grant_type", "client_credentials");
  body.set("scope", "https://graph.microsoft.com/.default");

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });

  const json = (await res.json()) as { access_token?: string; error?: string; error_description?: string };
  if (!res.ok || !json.access_token) {
    throw new Error(
      `Failed to get Graph token (${res.status}): ${json.error || "unknown_error"} ${json.error_description || ""}`.trim()
    );
  }
  return json.access_token;
}

async function sendGraphMail(args: {
  accessToken: string;
  fromUser: string;
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  textFallback?: string;
}): Promise<void> {
  const url = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(args.fromUser)}/sendMail`;

  const message: any = {
    subject: args.subject,
    body: { contentType: "HTML", content: args.html },
    toRecipients: [{ emailAddress: { address: args.to } }],
  };

  if (args.replyTo) {
    message.replyTo = [{ emailAddress: { address: args.replyTo } }];
  }

  // Some clients render a plain-text preview from HTML; optionally include a short preheader-ish fallback.
  if (args.textFallback) {
    message.bodyPreview = args.textFallback.slice(0, 255);
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${args.accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      message,
      saveToSentItems: "true",
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Graph sendMail failed (${res.status}): ${text}`);
  }
}

const htmlEsc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const MS_GRAPH_TENANT_ID = defineSecret("MS_GRAPH_TENANT_ID");
const MS_GRAPH_CLIENT_ID = defineSecret("MS_GRAPH_CLIENT_ID");
const MS_GRAPH_CLIENT_SECRET = defineSecret("MS_GRAPH_CLIENT_SECRET");
const MS_GRAPH_FROM_USER = defineSecret("MS_GRAPH_FROM_USER");
const MS_GRAPH_NOTIFY_TO = defineSecret("MS_GRAPH_NOTIFY_TO");

export const notifyOnNewContactMessageV2 = onDocumentCreated(
  {
    document: "contactMessages/{messageId}",
    region: "us-central1",
    secrets: [MS_GRAPH_TENANT_ID, MS_GRAPH_CLIENT_ID, MS_GRAPH_CLIENT_SECRET, MS_GRAPH_FROM_USER, MS_GRAPH_NOTIFY_TO],
    retry: false,
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const messageId = event.params.messageId as string;
    const data = snap.data() as ContactMessage;

    const db = getFirestore();

    const projectId = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || "unknown-project";
    const docUrl = `https://console.firebase.google.com/project/${projectId}/firestore/databases/-default-/data/~2FcontactMessages~2F${messageId}`;

    const name = safeText(data.name, "Unknown");
    const email = safeText(data.email, "N/A");
    const phone = safeText(data.phone, "");
    const subject = safeText(data.subject, "Contact Inquiry");
    const bodyMessage = safeText(data.message, "");
    const imageUrls = Array.isArray(data.imageUrls) ? data.imageUrls.filter((u) => typeof u === "string") : [];

    const textLines: string[] = [
      `New contact inquiry received`,
      ``,
      `Name: ${name}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : `Phone: (none)`,
      `Subject: ${subject}`,
      ``,
      `Message:`,
      bodyMessage || "(empty)",
      ``,
      imageUrls.length ? `Images:\n${imageUrls.map((u) => `- ${u}`).join("\n")}` : `Images: (none)`,
      ``,
      `View in Firestore: ${docUrl}`,
    ];

    const html = `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;">
        <h2 style="margin:0 0 12px;">New contact inquiry</h2>
        <p style="margin:0 0 8px;"><strong>Name:</strong> ${htmlEsc(name)}</p>
        <p style="margin:0 0 8px;"><strong>Email:</strong> ${htmlEsc(email)}</p>
        <p style="margin:0 0 8px;"><strong>Phone:</strong> ${htmlEsc(phone || "(none)")}</p>
        <p style="margin:0 0 8px;"><strong>Subject:</strong> ${htmlEsc(subject)}</p>
        <p style="margin:12px 0 6px;"><strong>Message:</strong></p>
        <pre style="white-space:pre-wrap;background:#f6f6f6;padding:12px;border-radius:8px;margin:0 0 12px;">${htmlEsc(
          bodyMessage || "(empty)"
        )}</pre>
        ${
          imageUrls.length
            ? `<p style="margin:0 0 6px;"><strong>Images:</strong></p><ul style="margin:0 0 12px;padding-left:18px;">${imageUrls
                .map((u) => `<li><a href="${u}" target="_blank" rel="noreferrer">${htmlEsc(u)}</a></li>`)
                .join("")}</ul>`
            : `<p style="margin:0 0 12px;"><strong>Images:</strong> (none)</p>`
        }
        <p style="margin:0;"><a href="${docUrl}" target="_blank" rel="noreferrer">View in Firestore</a></p>
      </div>
    `;

    try {
      const cfg = getGraphConfig();
      const token = await getGraphToken(cfg);

      await sendGraphMail({
        accessToken: token,
        fromUser: cfg.from_user,
        to: cfg.notify_to,
        subject: `New Contact Inquiry: ${subject} (${name})`,
        html,
        replyTo: email !== "N/A" ? email : undefined,
        textFallback: textLines.join("\n"),
      });

      await db.collection("contactMessages").doc(messageId).set(
        {
          notification: {
            email: {
              status: "sent",
              sentAt: FieldValue.serverTimestamp(),
            },
          },
        },
        { merge: true }
      );
    } catch (err) {
      console.error("Failed to send contact notification email:", err);
      await db.collection("contactMessages").doc(messageId).set(
        {
          notification: {
            email: {
              status: "failed",
              failedAt: FieldValue.serverTimestamp(),
            },
          },
        },
        { merge: true }
      );
    }
  }
);

