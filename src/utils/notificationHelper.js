/**
 * Notification Helper
 * Central place for creating notifications for all events
 */

import Notification from "../models/Notification.js";

/**
 * Create notification for user(s)
 * @param {Object} params
 * @param {number|number[]} params.user_id - Single user ID or array of user IDs
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification message
 * @param {string} params.type - Notification type
 * @param {number} params.reference_id - Related entity ID (optional)
 * @param {string} params.reference_type - Type of reference (optional)
 */
export const createNotification = async ({
  user_id,
  title,
  message,
  type,
  reference_id = null,
  reference_type = null,
}) => {
  try {
    const userIds = Array.isArray(user_id) ? user_id : [user_id];
    
    const notifications = userIds.map(uid => ({
      user_id: uid,
      title,
      message,
      type,
      reference_id,
      reference_type,
      is_read: false,
    }));

    await Notification.bulkCreate(notifications);
    console.log(`✅ Created ${notifications.length} notification(s) of type: ${type}`);
  } catch (error) {
    console.error("❌ Error creating notification:", error);
    // Don't throw - notifications shouldn't break main flow
  }
};

/**
 * Notification Templates
 */

// Campaign Creation & Payment
export const notifyCampaignSubmitted = async (campaignId, campaignTitle, umkmUserId, adminUserIds) => {
  // To Admin
  await createNotification({
    user_id: adminUserIds,
    title: "Campaign baru perlu ditinjau",
    message: `UMKM telah mengajukan campaign baru "${campaignTitle}". Silakan melakukan peninjauan.`,
    type: "campaign",
    reference_id: campaignId,
    reference_type: "campaign",
  });
};

export const notifyCampaignApproved = async (campaignId, campaignTitle, umkmUserId) => {
  console.log(`📢 [notifyCampaignApproved] Creating approval notification for campaign ${campaignId} to user ${umkmUserId}`);
  await createNotification({
    user_id: umkmUserId,
    title: "Campaign disetujui, lakukan pembayaran",
    message: `Campaign "${campaignTitle}" telah disetujui. Silakan lanjutkan pembayaran sebelum pukul 23:59.`,
    type: "campaign",
    reference_id: campaignId,
    reference_type: "campaign",
  });
  console.log(`✅ [notifyCampaignApproved] Notification creation completed`);
};

export const notifyCampaignRejected = async (campaignId, campaignTitle, umkmUserId, reason) => {
  await createNotification({
    user_id: umkmUserId,
    title: "Campaign dibatalkan",
    message: `Campaign "${campaignTitle}" dibatalkan oleh admin. Alasan: ${reason}`,
    type: "campaign",
    reference_id: campaignId,
    reference_type: "campaign",
  });
};

export const notifyPaymentSuccess = async (campaignId, campaignTitle, umkmUserId, adminUserIds, amount) => {
  // To UMKM
  await createNotification({
    user_id: umkmUserId,
    title: "Pembayaran berhasil",
    message: `Pembayaran berhasil! Kamu telah membayar sebesar Rp ${amount.toLocaleString('id-ID')}. Campaign kini aktif untuk pendaftaran student.`,
    type: "payment",
    reference_id: campaignId,
    reference_type: "campaign",
  });

  // To Admin
  await createNotification({
    user_id: adminUserIds,
    title: "Pembayaran berhasil",
    message: `Pembayaran untuk campaign "${campaignTitle}" telah diterima.`,
    type: "payment",
    reference_id: campaignId,
    reference_type: "campaign",
  });
};

export const notifyCampaignCancelled = async (campaignId, campaignTitle, umkmUserId, adminUserIds) => {
  // To UMKM
  await createNotification({
    user_id: umkmUserId,
    title: "Campaign dibatalkan",
    message: `Campaign "${campaignTitle}" dibatalkan karena melewati batas waktu pembayaran. Silakan buat campaign baru.`,
    type: "campaign",
    reference_id: campaignId,
    reference_type: "campaign",
  });

  // To Admin
  await createNotification({
    user_id: adminUserIds,
    title: "Campaign dibatalkan",
    message: `Campaign "${campaignTitle}" dibatalkan karena UMKM melewati batas waktu pembayaran.`,
    type: "campaign",
    reference_id: campaignId,
    reference_type: "campaign",
  });
};

// Registration Phase
export const notifyCampaignActive = async (campaignId, campaignTitle, studentUserIds) => {
  await createNotification({
    user_id: studentUserIds,
    title: "Campaign tersedia",
    message: `Campaign baru "${campaignTitle}" kini tersedia untuk pendaftaran.`,
    type: "campaign",
    reference_id: campaignId,
    reference_type: "campaign",
  });
};

export const notifyRegistrationReminder = async (campaignId, campaignTitle, studentUserIds, umkmUserId) => {
  // To Students (who haven't applied)
  await createNotification({
    user_id: studentUserIds,
    title: "Pendaftaran akan ditutup",
    message: `Pendaftaran campaign "${campaignTitle}" akan ditutup hari ini. Daftarkan dirimu sebelum terlambat!`,
    type: "campaign",
    reference_id: campaignId,
    reference_type: "campaign",
  });

  // To UMKM
  await createNotification({
    user_id: umkmUserId,
    title: "Periksa pendaftar",
    message: `Beberapa student telah mendaftar pada campaign "${campaignTitle}". Silakan lihat profil mereka terlebih dahulu. Kamu dapat memilih setelah registrasi ditutup.`,
    type: "campaign",
    reference_id: campaignId,
    reference_type: "campaign",
  });
};

export const notifyRegistrationClosed = async (campaignId, campaignTitle, umkmUserId) => {
  await createNotification({
    user_id: umkmUserId,
    title: "Mulai seleksi",
    message: `Periode registrasi telah berakhir untuk campaign "${campaignTitle}". Kamu dapat mulai memilih student hingga pukul 23:59 hari ini.`,
    type: "campaign",
    reference_id: campaignId,
    reference_type: "campaign",
  });
};

// Student Selection & Confirmation
export const notifyStudentSelected = async (campaignId, campaignTitle, studentUserId) => {
  await createNotification({
    user_id: studentUserId,
    title: "Undangan kolaborasi",
    message: `Anda terpilih untuk campaign "${campaignTitle}".`,
    type: "campaign",
    reference_id: campaignId,
    reference_type: "campaign",
  });
};

export const notifyStudentNotSelected = async (campaignId, campaignTitle, studentUserId) => {
  await createNotification({
    user_id: studentUserId,
    title: "Belum terpilih",
    message: `Anda belum terpilih untuk campaign "${campaignTitle}".`,
    type: "campaign",
    reference_id: campaignId,
    reference_type: "campaign",
  });
};

export const notifyStudentAccepted = async (campaignId, campaignTitle, umkmUserId, studentName) => {
  await createNotification({
    user_id: umkmUserId,
    title: "Student menerima",
    message: `${studentName} menerima undangan kolaborasi untuk campaign "${campaignTitle}".`,
    type: "campaign",
    reference_id: campaignId,
    reference_type: "campaign",
  });
};

export const notifyStudentRejected = async (campaignId, campaignTitle, umkmUserId, studentName) => {
  await createNotification({
    user_id: umkmUserId,
    title: "Student menolak",
    message: `${studentName} menolak undangan kolaborasi untuk campaign "${campaignTitle}".`,
    type: "campaign",
    reference_id: campaignId,
    reference_type: "campaign",
  });
};

export const notifyInvitationExpired = async (campaignId, campaignTitle, studentUserId) => {
  await createNotification({
    user_id: studentUserId,
    title: "Undangan tidak terkonfirmasi",
    message: `Konfirmasi untuk campaign "${campaignTitle}" telah berakhir. Anda dianggap tidak melanjutkan.`,
    type: "campaign",
    reference_id: campaignId,
    reference_type: "campaign",
  });
};

// Content Submission & Revision
export const notifyContentDeadlineReminder = async (campaignId, campaignTitle, studentUserId, deadline) => {
  await createNotification({
    user_id: studentUserId,
    title: "Deadline konten besok",
    message: `Batas submit konten: ${deadline}. Harap upload sebelum batas waktu untuk campaign "${campaignTitle}".`,
    type: "campaign",
    reference_id: campaignId,
    reference_type: "campaign",
  });
};

export const notifyContentSubmitted = async (campaignId, campaignTitle, umkmUserId, studentName) => {
  await createNotification({
    user_id: umkmUserId,
    title: "Konten masuk",
    message: `${studentName} telah mengirimkan konten untuk campaign "${campaignTitle}".`,
    type: "campaign",
    reference_id: campaignId,
    reference_type: "campaign",
  });
};

export const notifyContentDeadlinePassed = async (campaignId, campaignTitle, studentUserId, umkmUserId, studentName) => {
  // To Student
  await createNotification({
    user_id: studentUserId,
    title: "Gagal submit konten",
    message: `Anda gagal submit konten untuk campaign "${campaignTitle}" karena melewati deadline.`,
    type: "campaign",
    reference_id: campaignId,
    reference_type: "campaign",
  });

  // To UMKM
  await createNotification({
    user_id: umkmUserId,
    title: "Student gagal submit",
    message: `${studentName} gagal submit konten untuk campaign "${campaignTitle}".`,
    type: "campaign",
    reference_id: campaignId,
    reference_type: "campaign",
  });
};

export const notifyRevisionRequested = async (campaignId, campaignTitle, studentUserId, daysLeft) => {
  await createNotification({
    user_id: studentUserId,
    title: "Revisi diminta",
    message: `UMKM meminta revisi untuk campaign "${campaignTitle}". Anda memiliki ${daysLeft} hari untuk mengirim revisi.`,
    type: "campaign",
    reference_id: campaignId,
    reference_type: "campaign",
  });
};

export const notifyRevisionSubmitted = async (campaignId, campaignTitle, umkmUserId, studentName) => {
  await createNotification({
    user_id: umkmUserId,
    title: "Revisi masuk",
    message: `${studentName} telah mengirim revisi konten untuk campaign "${campaignTitle}".`,
    type: "campaign",
    reference_id: campaignId,
    reference_type: "campaign",
  });
};

export const notifyRevisionFailed = async (campaignId, campaignTitle, studentUserId, umkmUserId, studentName) => {
  // To Student
  await createNotification({
    user_id: studentUserId,
    title: "Gagal revisi",
    message: `Revisi tidak dikirim untuk campaign "${campaignTitle}".`,
    type: "campaign",
    reference_id: campaignId,
    reference_type: "campaign",
  });

  // To UMKM
  await createNotification({
    user_id: umkmUserId,
    title: "Student gagal revisi",
    message: `${studentName} gagal mengirim revisi untuk campaign "${campaignTitle}".`,
    type: "campaign",
    reference_id: campaignId,
    reference_type: "campaign",
  });
};

// Violation Handling
export const notifyViolationReported = async (campaignId, campaignTitle, adminUserIds) => {
  await createNotification({
    user_id: adminUserIds,
    title: "Perlu ditinjau",
    message: `Konten mahasiswa pada campaign "${campaignTitle}" dilaporkan dan perlu ditinjau oleh admin.`,
    type: "violation",
    reference_id: campaignId,
    reference_type: "campaign",
  });
};

export const notifyViolationConfirmed = async (campaignId, campaignTitle, umkmUserId, studentUserId) => {
  // To UMKM
  await createNotification({
    user_id: umkmUserId,
    title: "Konten ditolak",
    message: `Konten dinyatakan melanggar dan ditolak secara final oleh admin untuk campaign "${campaignTitle}".`,
    type: "violation",
    reference_id: campaignId,
    reference_type: "campaign",
  });

  // To Student
  await createNotification({
    user_id: studentUserId,
    title: "Konten ditolak",
    message: `Konten kamu dinyatakan melanggar dan ditolak secara final oleh admin untuk campaign "${campaignTitle}".`,
    type: "violation",
    reference_id: campaignId,
    reference_type: "campaign",
  });
};

export const notifyViolationRejected = async (campaignId, campaignTitle, umkmUserId) => {
  await createNotification({
    user_id: umkmUserId,
    title: "Lanjutkan review",
    message: `Laporan pelanggaran ditolak untuk campaign "${campaignTitle}". Konten dapat dilanjutkan untuk direview atau disetujui.`,
    type: "violation",
    reference_id: campaignId,
    reference_type: "campaign",
  });
};

// Posting
export const notifyContentApproved = async (campaignId, campaignTitle, studentUserId) => {
  await createNotification({
    user_id: studentUserId,
    title: "Konten disetujui",
    message: `Konten kamu telah disetujui untuk campaign "${campaignTitle}"! Silakan lanjut posting sesuai jadwal.`,
    type: "campaign",
    reference_id: campaignId,
    reference_type: "campaign",
  });
};

export const notifyPostingReminder = async (campaignId, campaignTitle, studentUserId, isToday) => {
  const message = isToday 
    ? `Hari ini batas posting konten untuk campaign "${campaignTitle}".`
    : `Reminder: batas posting konten besok untuk campaign "${campaignTitle}".`;
    
  await createNotification({
    user_id: studentUserId,
    title: "Reminder posting",
    message,
    type: "campaign",
    reference_id: campaignId,
    reference_type: "campaign",
  });
};

export const notifyPostingSubmitted = async (campaignId, campaignTitle, umkmUserId, studentName) => {
  await createNotification({
    user_id: umkmUserId,
    title: "Review konten yang sudah disubmit",
    message: `${studentName} telah melakukan posting untuk campaign "${campaignTitle}".`,
    type: "campaign",
    reference_id: campaignId,
    reference_type: "campaign",
  });
};

export const notifyPostingFailed = async (campaignId, campaignTitle, studentUserId, umkmUserId, studentName) => {
  // To Student
  await createNotification({
    user_id: studentUserId,
    title: "Konten tidak diposting",
    message: `Posting tidak dilakukan untuk campaign "${campaignTitle}" — Anda dianggap gagal posting.`,
    type: "campaign",
    reference_id: campaignId,
    reference_type: "campaign",
  });

  // To UMKM
  await createNotification({
    user_id: umkmUserId,
    title: "Konten tidak diposting",
    message: `${studentName} gagal melakukan posting untuk campaign "${campaignTitle}" — tidak dikenakan biaya.`,
    type: "campaign",
    reference_id: campaignId,
    reference_type: "campaign",
  });
};

export const notifyPostingAccepted = async (campaignId, campaignTitle, studentUserId) => {
  await createNotification({
    user_id: studentUserId,
    title: "Konten kamu telah memenuhi kriteria!",
    message: `Konten telah disetujui untuk campaign "${campaignTitle}", dana akan segera cair.`,
    type: "campaign",
    reference_id: campaignId,
    reference_type: "campaign",
  });
};

export const notifyPostingRejected = async (campaignId, campaignTitle, studentUserId, umkmUserId) => {
  await createNotification({
    user_id: studentUserId,
    title: "Konten ditolak",
    message: `Konten tidak memenuhi kriteria posting untuk campaign "${campaignTitle}".`,
    type: "campaign",
    reference_id: campaignId,
    reference_type: "campaign",
  });
};

// Payout Phase
export const notifyPayoutSuccess = async (campaignId, campaignTitle, umkmUserId, studentUserIds, hasCashback, completionDate) => {
  // To UMKM
  const umkmMessage = hasCashback
    ? `Campaign "${campaignTitle}" telah selesai pada ${completionDate}. Dana telah dicairkan kepada mahasiswa. Silakan cek dana pengembalian Anda.`
    : `Campaign "${campaignTitle}" telah selesai. Dana telah dicairkan kepada mahasiswa.`;
    
  await createNotification({
    user_id: umkmUserId,
    title: "Berhasil terbayar",
    message: umkmMessage,
    type: "payment",
    reference_id: campaignId,
    reference_type: "campaign",
  });

  // To Students
  await createNotification({
    user_id: studentUserIds,
    title: "Dana telah cair",
    message: `Selamat! Kamu telah menyelesaikan campaign "${campaignTitle}". Dana telah cair.`,
    type: "payment",
    reference_id: campaignId,
    reference_type: "campaign",
  });
};

export const notifyPayoutFailed = async (campaignId, campaignTitle, adminUserIds, studentUserIds) => {
  // To Admin
  await createNotification({
    user_id: adminUserIds,
    title: "Perlu tindakan",
    message: `Terjadi kegagalan pencairan dana untuk campaign "${campaignTitle}". Diperlukan proses pembayaran ulang.`,
    type: "system",
    reference_id: campaignId,
    reference_type: "campaign",
  });

  // To Students
  await createNotification({
    user_id: studentUserIds,
    title: "Pencairan tertunda",
    message: `Pencairan dana untuk campaign "${campaignTitle}" sedang dalam proses penanganan. Tim kami akan segera menyelesaikannya.`,
    type: "system",
    reference_id: campaignId,
    reference_type: "campaign",
  });
};

export const notifyCampaignComplete = async (campaignId, campaignTitle, umkmUserId, studentUserIds) => {
  // To UMKM (D+7 after payout)
  await createNotification({
    user_id: umkmUserId,
    title: "Campaign selesai",
    message: `Campaign "${campaignTitle}" telah resmi selesai. Terima kasih telah mempercayakan kolaborasi Anda kepada InfluEnt.`,
    type: "campaign",
    reference_id: campaignId,
    reference_type: "campaign",
  });

  // To Students (D+7 after payout)
  await createNotification({
    user_id: studentUserIds,
    title: "Terima kasih!",
    message: `Terima kasih telah berpartisipasi dalam campaign "${campaignTitle}". Sampai jumpa di campaign berikutnya!`,
    type: "campaign",
    reference_id: campaignId,
    reference_type: "campaign",
  });
};

export default {
  createNotification,
  // Export all notification functions
  notifyCampaignSubmitted,
  notifyCampaignApproved,
  notifyCampaignRejected,
  notifyPaymentSuccess,
  notifyCampaignCancelled,
  notifyCampaignActive,
  notifyRegistrationReminder,
  notifyRegistrationClosed,
  notifyStudentSelected,
  notifyStudentNotSelected,
  notifyStudentAccepted,
  notifyStudentRejected,
  notifyInvitationExpired,
  notifyContentDeadlineReminder,
  notifyContentSubmitted,
  notifyContentDeadlinePassed,
  notifyRevisionRequested,
  notifyRevisionSubmitted,
  notifyRevisionFailed,
  notifyViolationReported,
  notifyViolationConfirmed,
  notifyViolationRejected,
  notifyContentApproved,
  notifyPostingReminder,
  notifyPostingSubmitted,
  notifyPostingFailed,
  notifyPostingAccepted,
  notifyPostingRejected,
  notifyPayoutSuccess,
  notifyPayoutFailed,
  notifyCampaignComplete,
};
