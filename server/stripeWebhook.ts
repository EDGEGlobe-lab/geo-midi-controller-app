import type { RequestHandler } from "express";
import Stripe from "stripe";

export const stripeWebhookHandler: RequestHandler = (req, res) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers["stripe-signature"];
  if (!secret || typeof signature !== "string") return res.status(400).json({ error: "Stripe webhook is not configured" });

  let event: Stripe.Event;
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
    event = stripe.webhooks.constructEvent(req.body, signature, secret);
  } catch (error) {
    return res.status(400).json({ error: "Invalid Stripe webhook signature" });
  }

  if (event.id.startsWith("evt_test_")) {
    console.log("[Stripe] Test event verified", { type: event.type, id: event.id });
    return res.json({ verified: true });
  }

  if (["checkout.session.completed", "payment_intent.succeeded", "invoice.paid"].includes(event.type)) {
    console.log("[Stripe] Payment event received", { type: event.type, id: event.id, created: event.created });
  }
  return res.json({ received: true });
};
