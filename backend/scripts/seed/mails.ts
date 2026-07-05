import type { SeedDatabase } from "./shared";
import { hour, json, now, run } from "./shared";

const siteTitle = "Blog";
const siteFooter =
  "Blog · Built with uni-app, Vue 3, Bun, Elysia and SQLite";
const hue = 208;

const mails = [
  {
    uuid: "seed-mail-smtp-success",
    type: "smtp_test",
    fromName: siteTitle,
    fromEmail: "no-reply@example.com",
    to: "admin@example.com",
    subject: "SMTP 测试邮件发送成功",
    status: "success",
    errorMessage: null,
    params: {
      siteTitle,
      siteFooter,
      hue,
      senderEmail: "no-reply@example.com",
      sentAt: "系统初始化时生成",
      testMessage: "这是一封用于预览后台邮件日志样式的测试邮件。",
      footerNote: "邮件系统已准备好用于发送验证码、登录提醒和链接审核通知。",
    },
    isRead: 1,
    createdAt: now - 2 * hour,
  },
  {
    uuid: "seed-mail-login-alert",
    type: "login_alert",
    fromName: "安全提醒",
    fromEmail: "security@example.com",
    to: "admin@example.com",
    subject: "检测到新的后台登录",
    status: "success",
    errorMessage: null,
    params: {
      siteTitle,
      siteFooter,
      hue,
      currentIp: "127.0.0.1",
      currentLocation: "本地开发环境",
      previousLocation: "上一次登录位置",
      loginAt: "系统初始化时生成",
    },
    isRead: 0,
    createdAt: now - 5 * hour,
  },
  {
    uuid: "seed-mail-reset-password",
    type: "reset_password",
    fromName: "账号服务",
    fromEmail: "account@example.com",
    to: "admin@example.com",
    subject: "Blog 密码重置验证码",
    status: "success",
    errorMessage: null,
    params: {
      siteTitle,
      siteFooter,
      hue,
      code: "842519",
      expiresInMinutes: 15,
      ip: "127.0.0.1",
      location: "本地开发环境",
    },
    isRead: 0,
    createdAt: now - 9 * hour,
  },
  {
    uuid: "seed-mail-friend-apply",
    type: "friend_link_apply",
    fromName: "技术链接建议",
    fromEmail: "links@example.com",
    to: "admin@example.com",
    subject: "新的技术资料链接建议：MDN Web Docs",
    status: "success",
    errorMessage: null,
    params: {
      siteTitle,
      siteFooter,
      greeting: "你好，Kexin！",
      hue,
      siteName: "MDN Web Docs",
      siteUrl: "https://developer.mozilla.org/",
      siteDescription:
        "面向 Web 开发者的文档资料库，可作为 Vue 3 学习之外的 HTML、CSS、JavaScript 官方参考入口。",
      siteTags: ["Web 文档", "JavaScript", "CSS"],
      applicantEmail: "dev-notes@example.com",
    },
    isRead: 0,
    createdAt: now - 14 * hour,
  },
  {
    uuid: "seed-mail-friend-confirmed",
    type: "friend_link_apply_confirmed",
    fromName: siteTitle,
    fromEmail: "no-reply@example.com",
    to: "dev-notes@example.com",
    subject: "已收到你的技术资料链接建议",
    status: "success",
    errorMessage: null,
    params: {
      siteTitle,
      siteFooter,
      hue,
      applicantSiteName: "MDN Web Docs",
    },
    isRead: 1,
    createdAt: now - 13 * hour,
  },
  {
    uuid: "seed-mail-friend-approved",
    type: "friend_link_approved",
    fromName: "技术链接审核",
    fromEmail: "links@example.com",
    to: "resource@example.com",
    subject: "技术资料链接已收录：VueUse",
    status: "success",
    errorMessage: null,
    params: {
      siteTitle,
      siteFooter,
      hue,
      applicantSiteName: "VueUse",
      result: "approved",
    },
    isRead: 1,
    createdAt: now - 7 * hour,
  },
  {
    uuid: "seed-mail-friend-rejected",
    type: "friend_link_rejected",
    fromName: "技术链接审核",
    fromEmail: "links@example.com",
    to: "old-resource@example.com",
    subject: "资料链接建议暂未收录：旧版 Vue 2 镜像站",
    status: "success",
    errorMessage: null,
    params: {
      siteTitle,
      siteFooter,
      hue,
      applicantSiteName: "旧版 Vue 2 镜像站",
      result: "rejected",
      rejectReason:
        "当前小站主要整理 Vue 3 笔记和项目技术栈官方资料，暂不收录过期镜像站。",
    },
    isRead: 1,
    createdAt: now - 22 * hour,
  },
  {
    uuid: "seed-mail-smtp-failed",
    type: "smtp_test",
    fromName: siteTitle,
    fromEmail: "no-reply@example.com",
    to: "admin@example.com",
    subject: "SMTP 测试失败",
    status: "failed",
    errorMessage: "Authentication failed: invalid credentials",
    params: {
      siteTitle,
      siteFooter,
      hue,
      senderEmail: "no-reply@example.com",
      sentAt: "系统初始化时生成",
      testMessage: "这条失败记录用于测试后台邮件日志的错误状态展示。",
      footerNote: "请检查 SMTP 主机、端口、账号、授权码和发件人配置。",
    },
    isRead: 0,
    createdAt: now - 30 * hour,
  },
];

function upsertMail(db: SeedDatabase, mail: (typeof mails)[number]) {
  run(
    db,
    `
    INSERT INTO email_log
      (uuid, type, from_name, from_email, "to", subject, status, error_message, params, is_read, created_at)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(uuid) DO UPDATE SET
      type = excluded.type,
      from_name = excluded.from_name,
      from_email = excluded.from_email,
      "to" = excluded."to",
      subject = excluded.subject,
      status = excluded.status,
      error_message = excluded.error_message,
      params = excluded.params,
      is_read = excluded.is_read,
      created_at = excluded.created_at
    `,
    [
      mail.uuid,
      mail.type,
      mail.fromName,
      mail.fromEmail,
      mail.to,
      mail.subject,
      mail.status,
      mail.errorMessage,
      json(mail.params),
      mail.isRead,
      mail.createdAt,
    ],
  );
}

export function seedMails(db: SeedDatabase) {
  // 按当前内容定位重置邮件日志，避免旧的“薄荷糖手账”等演示友链邮件继续残留。
  run(db, "DELETE FROM email_log");
  for (const mail of mails) upsertMail(db, mail);
  return mails.length;
}
