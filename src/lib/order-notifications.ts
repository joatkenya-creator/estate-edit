import "server-only";

import { sendEmail } from "@/lib/email";
import { sendSms } from "@/lib/sms";
import { formatMoney, type CartItem } from "@/lib/site";

export type OrderEvent =
  | "placed"
  | "confirmed"
  | "dispatched"
  | "delivered"
  | "payment_received"
  | "returned"
  | "cancelled";

export type OrderNotificationData = {
  event: OrderEvent;
  orderNumber: string;
  fullName: string;
  phone: string;
  email?: string;
  total: number;
  currency: string;
  items?: CartItem[];
  subtotal?: number;
  deliveryFee?: number;
  amountPaid?: number;
};

function firstName(fullName: string): string {
  return fullName.split(" ")[0];
}

type EmailContent = { subject: string; text: string };

function buildEmailContent(data: OrderNotificationData): EmailContent | null {
  const { event, orderNumber, fullName, total, currency, items, subtotal, deliveryFee, amountPaid } = data;
  const name = firstName(fullName);
  const totalStr = formatMoney(total, currency);

  switch (event) {
    case "placed": {
      const lines = items
        ? items
            .map((it) => `  - ${it.quantity}x ${it.title}: ${formatMoney(it.price * it.quantity, currency)}`)
            .join("\n")
        : "";
      return {
        subject: `Order ${orderNumber} received — The Estate Edit`,
        text: [
          `Hi ${name},`,
          ``,
          `Thank you for your order! Here is a summary:`,
          ``,
          `Order number: ${orderNumber}`,
          lines,
          ``,
          subtotal !== undefined ? `Subtotal: ${formatMoney(subtotal, currency)}` : null,
          deliveryFee !== undefined ? `Delivery:  ${formatMoney(deliveryFee, currency)}` : null,
          `Total:     ${totalStr}`,
          ``,
          `Payment is collected after delivery. We will contact you to confirm your order and arrange a convenient delivery time.`,
          ``,
          `Thank you for choosing The Estate Edit.`,
          ``,
          `— The Estate Edit`,
        ]
          .filter((l) => l !== null)
          .join("\n"),
      };
    }

    case "confirmed":
      return {
        subject: `Order ${orderNumber} confirmed — The Estate Edit`,
        text: [
          `Hi ${name},`,
          ``,
          `Your order ${orderNumber} (${totalStr}) has been confirmed.`,
          ``,
          `We are preparing your items for delivery and will be in touch to arrange a convenient time.`,
          ``,
          `— The Estate Edit`,
        ].join("\n"),
      };

    case "dispatched":
      return {
        subject: `Your order ${orderNumber} is on its way — The Estate Edit`,
        text: [
          `Hi ${name},`,
          ``,
          `Your order ${orderNumber} is out for delivery!`,
          ``,
          `Our delivery team will call you before arriving. Please ensure someone is available to receive the items and make payment (${totalStr}).`,
          ``,
          `— The Estate Edit`,
        ].join("\n"),
      };

    case "delivered":
      return {
        subject: `Order ${orderNumber} delivered — The Estate Edit`,
        text: [
          `Hi ${name},`,
          ``,
          `Your order ${orderNumber} has been delivered. We hope you love your new items!`,
          ``,
          `Thank you for shopping with The Estate Edit.`,
          ``,
          `— The Estate Edit`,
        ].join("\n"),
      };

    case "payment_received":
      return {
        subject: `Payment received for order ${orderNumber} — The Estate Edit`,
        text: [
          `Hi ${name},`,
          ``,
          `We have received your payment${amountPaid ? ` of ${formatMoney(amountPaid, currency)}` : ""} for order ${orderNumber}. Thank you!`,
          ``,
          `— The Estate Edit`,
        ].join("\n"),
      };

    case "returned":
      return {
        subject: `Return confirmed for order ${orderNumber} — The Estate Edit`,
        text: [
          `Hi ${name},`,
          ``,
          `We have received your return request for order ${orderNumber}.`,
          ``,
          `Our team will be in touch shortly to arrange collection and process your return.`,
          ``,
          `— The Estate Edit`,
        ].join("\n"),
      };

    case "cancelled":
      return {
        subject: `Order ${orderNumber} cancelled — The Estate Edit`,
        text: [
          `Hi ${name},`,
          ``,
          `Your order ${orderNumber} has been cancelled.`,
          ``,
          `If you have any questions or would like to place a new order, please don't hesitate to contact us.`,
          ``,
          `— The Estate Edit`,
        ].join("\n"),
      };

    default:
      return null;
  }
}

function buildSmsText(data: OrderNotificationData): string | null {
  const { event, orderNumber, fullName, total, currency, amountPaid } = data;
  const name = firstName(fullName);
  const totalStr = formatMoney(total, currency);

  switch (event) {
    case "placed":
      return `Hi ${name}, your order ${orderNumber} (${totalStr}) is received. We'll call you to arrange delivery. Pay after delivery. - The Estate Edit`;
    case "confirmed":
      return `Hi ${name}, order ${orderNumber} is confirmed! We'll contact you to arrange delivery. - The Estate Edit`;
    case "dispatched":
      return `Hi ${name}, order ${orderNumber} is on its way! Our team will call before arrival. - The Estate Edit`;
    case "delivered":
      return `Hi ${name}, order ${orderNumber} has been delivered. Thank you for shopping with us! - The Estate Edit`;
    case "payment_received":
      return `Hi ${name}, payment${amountPaid ? ` of ${formatMoney(amountPaid, currency)}` : ""} received for order ${orderNumber}. Thank you! - The Estate Edit`;
    case "returned":
      return `Hi ${name}, your return for order ${orderNumber} is being processed. We'll be in touch soon. - The Estate Edit`;
    case "cancelled":
      return `Hi ${name}, order ${orderNumber} has been cancelled. Questions? Contact us. - The Estate Edit`;
    default:
      return null;
  }
}

export async function notifyCustomer(data: OrderNotificationData): Promise<void> {
  const emailContent = buildEmailContent(data);
  const smsText = buildSmsText(data);

  const tasks: Promise<void>[] = [];

  if (data.email && emailContent) {
    tasks.push(sendEmail(data.email, emailContent.subject, emailContent.text));
  }

  if (smsText) {
    tasks.push(sendSms(data.phone, smsText));
  }

  await Promise.allSettled(tasks);
}
