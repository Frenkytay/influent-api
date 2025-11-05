import midtransClient from "midtrans-client";
import Campaign from "../models/Campaign.js";
import User from "../models/User.js";
import Payment from "../models/Payment.js";
import { v4 as uuidv4 } from "uuid";

const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
const clientKey = process.env.MIDTRANS_CLIENT_KEY || "";

const snap = new midtransClient.Snap({
  isProduction,
  serverKey,
  clientKey,
});

// Create payment for a campaign. Body: { campaign_id, user_id }
export const createPayment = async (req, res) => {
  try {
    const { campaign_id, user_id } = req.body;
    if (!campaign_id)
      return res.status(400).json({ error: "campaign_id is required" });

    const campaign = await Campaign.findByPk(campaign_id);
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    // Determine amount: prefer campaign_price, fallback to price_per_post * influencer_count
    let amount = 0;
    if (campaign.campaign_price) amount = Number(campaign.campaign_price);
    else if (campaign.price_per_post && campaign.influencer_count)
      amount =
        Number(campaign.price_per_post) * Number(campaign.influencer_count);
    else
      return res
        .status(400)
        .json({ error: "No price configured for this campaign" });

    // Build order_id
    const order_id = `CAMPAIGN-${campaign_id}-${Date.now()}-${Math.floor(
      Math.random() * 1000
    )}`;

    const customer = {};
    if (user_id) {
      const user = await User.findByPk(user_id);
      if (user) {
        customer.first_name = user.name || "";
        customer.email = user.email || "";
      }
    }

    const parameter = {
      transaction_details: {
        order_id,
        gross_amount: Math.round(amount),
      },
      item_details: [
        {
          id: `campaign-${campaign_id}`,
          price: Math.round(amount),
          quantity: 1,
          name: campaign.title || `Campaign ${campaign_id}`,
        },
      ],
      customer_details: customer,
    };

    const snapResponse = await snap.createTransaction(parameter);

    // Save payment record with pending status
    const payment = await Payment.create({
      order_id,
      campaign_id,
      user_id: user_id || null,
      amount: amount,
      status: "pending",
      raw_response: snapResponse,
    });

    // snapResponse may contain token / redirect_url depending on SDK
    return res.status(201).json({ payment, snap: snapResponse });
  } catch (err) {
    console.error("Error creating payment:", err);
    return res
      .status(500)
      .json({ error: "Failed to create payment", details: err.message });
  }
};

// Midtrans notification handler (Snap/Core will POST notification to this endpoint)
export const notification = async (req, res) => {
  try {
    const core = new midtransClient.CoreApi();
    core.apiConfig.set({
      isProduction,
      serverKey,
      clientKey,
    });

    const notificationJson = req.body;

    // Validate & get status (Core API has transaction.notification)
    const statusResponse = await core.transaction.notification(
      notificationJson
    );

    const order_id = statusResponse.order_id;
    const payment = await Payment.findOne({ where: { order_id } });
    if (!payment) {
      console.warn("Payment not found for order_id", order_id);
      return res.status(404).json({ error: "Payment not found" });
    }

    // Update payment record
    await payment.update({
      status: statusResponse.transaction_status,
      payment_type: statusResponse.payment_type,
      transaction_time: statusResponse.transaction_time
        ? new Date(statusResponse.transaction_time)
        : null,
      raw_response: statusResponse,
    });

    // You can also update campaign status or notify user here

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Error in payment notification:", err);
    return res
      .status(500)
      .json({ error: "Notification processing failed", details: err.message });
  }
};

// Get payment by order_id or payment_id
export const getPayment = async (req, res) => {
  try {
    const { id } = req.params; // id can be order_id or payment_id

    // Try by payment_id first (numeric)
    let payment = null;
    if (/^\d+$/.test(id)) {
      payment = await Payment.findByPk(Number(id));
    }

    // If not found by PK, try order_id
    if (!payment) {
      payment = await Payment.findOne({ where: { order_id: id } });
    }

    if (!payment) return res.status(404).json({ error: "Payment not found" });

    // Optionally verify with Midtrans Core API for up-to-date status
    try {
      const core = new midtransClient.CoreApi();
      core.apiConfig.set({ isProduction, serverKey, clientKey });

      const status = await core.transaction.status(payment.order_id);
      // merge remote status into response without altering DB
      return res.json({ payment, midtrans: status });
    } catch (err) {
      // If Midtrans check fails, still return local payment
      console.warn("Midtrans status check failed", err.message);
      return res.json({ payment });
    }
  } catch (err) {
    console.error("Error fetching payment:", err);
    return res
      .status(500)
      .json({ error: "Failed to fetch payment", details: err.message });
  }
};

// Handle redirect return from Midtrans (user redirected back)
export const handleReturn = async (req, res) => {
  try {
    // Midtrans may redirect with order_id or transaction_id in query params
    const { order_id, orderId, transaction_id } = req.query;
    const lookupOrderId =
      order_id || orderId || req.query.order || req.query.orderId;

    if (!lookupOrderId) {
      return res.status(400).send("order_id is required");
    }

    const core = new midtransClient.CoreApi();
    core.apiConfig.set({ isProduction, serverKey, clientKey });

    // Get latest status from Midtrans
    let statusResponse;
    try {
      statusResponse = await core.transaction.status(lookupOrderId);
    } catch (err) {
      console.warn(
        "Failed to fetch Midtrans status for",
        lookupOrderId,
        err.message
      );
      // If we can't reach Midtrans, fallback to local DB
      const paymentFallback = await Payment.findOne({
        where: { order_id: lookupOrderId },
      });
      if (!paymentFallback) return res.status(404).send("Payment not found");
      // Redirect to frontend with pending status
      const frontendPending =
        process.env.FRONTEND_PENDING_URL || process.env.FRONTEND_URL || "/";
      return res.redirect(
        `${frontendPending}?order_id=${encodeURIComponent(
          lookupOrderId
        )}&status=pending`
      );
    }

    const orderIdResp = statusResponse.order_id || lookupOrderId;
    const payment = await Payment.findOne({ where: { order_id: orderIdResp } });
    if (!payment) {
      console.warn("Payment not found for order_id", orderIdResp);
      // still redirect to frontend with status from Midtrans
      const frontendUrl =
        statusResponse.transaction_status === "settlement" ||
        statusResponse.transaction_status === "capture"
          ? process.env.FRONTEND_SUCCESS_URL || process.env.FRONTEND_URL || "/"
          : process.env.FRONTEND_FAILURE_URL || process.env.FRONTEND_URL || "/";
      return res.redirect(
        `${frontendUrl}?order_id=${encodeURIComponent(
          orderIdResp
        )}&status=${encodeURIComponent(statusResponse.transaction_status)}`
      );
    }

    // Map Midtrans statuses to our DB status
    let newStatus = statusResponse.transaction_status;
    // normalize common success states
    if (newStatus === "settlement" || newStatus === "capture")
      newStatus = "success";
    if (
      newStatus === "deny" ||
      newStatus === "cancel" ||
      newStatus === "expire"
    )
      newStatus = "failed";

    await payment.update({
      status: newStatus,
      payment_type: statusResponse.payment_type || payment.payment_type,
      transaction_time: statusResponse.transaction_time
        ? new Date(statusResponse.transaction_time)
        : payment.transaction_time,
      raw_response: statusResponse,
    });

    // Redirect user to frontend success or failure page
    const frontendSuccess =
      process.env.FRONTEND_SUCCESS_URL || process.env.FRONTEND_URL || "/";
    const frontendFailure =
      process.env.FRONTEND_FAILURE_URL || process.env.FRONTEND_URL || "/";

    if (
      newStatus === "success" ||
      statusResponse.transaction_status === "settlement" ||
      statusResponse.transaction_status === "capture"
    ) {
      return res.redirect(
        `${frontendSuccess}?order_id=${encodeURIComponent(
          orderIdResp
        )}&status=success`
      );
    }

    // pending or failed
    return res.redirect(
      `${frontendFailure}?order_id=${encodeURIComponent(
        orderIdResp
      )}&status=${encodeURIComponent(
        statusResponse.transaction_status || newStatus
      )}`
    );
  } catch (err) {
    console.error("Error handling return:", err);
    return res.status(500).send("Internal error");
  }
};

export default { createPayment, notification, getPayment, handleReturn };
