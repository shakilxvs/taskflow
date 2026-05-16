import emailjs from "@emailjs/browser";

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
const FALLBACK_EMAIL = process.env.NEXT_PUBLIC_DEFAULT_NOTIFICATION_EMAIL;

export async function sendTaskDoneEmail({ task, business, completedBy }) {
  const toEmail = business?.notificationEmail || FALLBACK_EMAIL;

  const templateParams = {
    to_email: toEmail,
    business_name: business?.name || "—",
    task_name: task.title,
    due_time: task.time || "No time set",
    completed_by: completedBy || "Team member",
    completed_date: new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    tag: task.tag || "General",
  };

  return emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
}
