import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../config/firebase";

const PAYMENTS_COLLECTION = "payments";

export function formatPaidAt(date) {
  if (!date || Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDetailDate(date) {
  if (!date || Number.isNaN(date.getTime())) return "";
  const d = date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const t = date.toLocaleString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${d} • ${t}`;
}

export function formatMonthGroup(date) {
  if (!date || Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleString("en-IN", { month: "long", year: "numeric" });
}

function getTypeCategory(paymentType, status) {
  if (status === "refund" || status === "received") return "Received";
  if (paymentType === "Bus Pass") return "Paid";
  return "Paid";
}

function getListTitle(paymentType, paymentMethod, status) {
  if (status === "failed") return "Payment failed";
  if (status === "pending") return "Payment pending";
  if (paymentType === "Bus Pass") return "Paid to Bus Pass";
  return `Paid via ${paymentMethod}`;
}

export function normalizePayment(docId, data) {
  let paidAt = new Date();

  if (data?.paidAt?.toDate) {
    paidAt = data.paidAt.toDate();
  } else if (data?.paidAt?.seconds) {
    paidAt = new Date(data.paidAt.seconds * 1000);
  } else if (data?.paidAt) {
    paidAt = new Date(data.paidAt);
  }

  const amount = Number(data?.amount) || 0;
  const status = String(data?.status || "pending").toLowerCase();
  const paymentMethod = data?.paymentMethod || "UPI";
  const paymentType =
    data?.paymentType || (data?.docPassId ? "Bus Pass" : "Payment");

  const statusLabel =
    status === "success"
      ? "Successful"
      : status === "failed"
        ? "Failed"
        : "Pending";

  const typeCategory = getTypeCategory(paymentType, status);
  const isCredit = typeCategory === "Received";

  return {
    id: docId,
    paymentId: data?.paymentId || docId,
    amount,
    status,
    statusLabel,
    paymentMethod,
    paymentType,
    typeCategory,
    transactionId: data?.transactionId || "",
    docPassId: data?.docPassId || "",
    userId: data?.userId || "",
    paidAt,
    paidAtLabel: formatPaidAt(paidAt),
    paidAtDetail: formatDetailDate(paidAt),
    monthGroup: formatMonthGroup(paidAt),
    title: getListTitle(paymentType, paymentMethod, status),
    subtitle: `Via ${paymentMethod}`,
    sourceLabel: isCredit ? `Received in ${paymentMethod}` : `Sent from ${paymentMethod}`,
    avatarLetter: (paymentType || "P").charAt(0).toUpperCase(),
    isCredit,
  };
}

export function applyPaymentFilters(payments, filters) {
  return payments.filter((p) => {
    if (filters.status?.length) {
      if (!filters.status.includes(p.statusLabel)) return false;
    }

    if (filters.paymentMethod?.length) {
      if (!filters.paymentMethod.includes(p.paymentMethod)) return false;
    }

    if (filters.filterDate) {
      const start = new Date(filters.filterDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(filters.filterDate);
      end.setHours(23, 59, 59, 999);
      if (p.paidAt < start || p.paidAt > end) return false;
    }

    if (filters.amount?.length) {
      const inRange = filters.amount.some((range) => {
        if (range === "Under ₹100") return p.amount < 100;
        if (range === "₹100 - ₹500") return p.amount >= 100 && p.amount <= 500;
        if (range === "Above ₹500") return p.amount > 500;
        return true;
      });
      if (!inRange) return false;
    }

    if (filters.search?.trim()) {
      const q = filters.search.trim().toLowerCase();
      const haystack = [
        p.title,
        p.paymentId,
        p.transactionId,
        p.paymentMethod,
        p.paymentType,
        p.typeCategory,
        String(p.amount),
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}

export function groupPaymentsByMonth(payments) {
  const groups = {};
  payments.forEach((p) => {
    const key = p.monthGroup;
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  });
  return Object.entries(groups).map(([month, items]) => ({ month, items }));
}

export function subscribeUserPayments(userId, onData, onError) {
  const q = query(
    collection(db, PAYMENTS_COLLECTION),
    where("userId", "==", userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs
        .map((d) => normalizePayment(d.id, d.data()))
        .sort((a, b) => b.paidAt - a.paidAt);
      onData(list);
    },
    onError
  );
}

export function subscribePaymentById(paymentDocId, onData, onError) {
  const ref = doc(db, PAYMENTS_COLLECTION, paymentDocId);
  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        onData(normalizePayment(snap.id, snap.data()));
      } else {
        onData(null);
      }
    },
    onError
  );
}

export async function fetchUserPayments(userId) {
  const q = query(
    collection(db, PAYMENTS_COLLECTION),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((d) => normalizePayment(d.id, d.data()))
    .sort((a, b) => b.paidAt - a.paidAt);
}

export async function fetchPaymentById(paymentDocId) {
  const ref = doc(db, PAYMENTS_COLLECTION, paymentDocId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return normalizePayment(snap.id, snap.data());
  }

  const q = query(
    collection(db, PAYMENTS_COLLECTION),
    where("paymentId", "==", paymentDocId)
  );
  const found = await getDocs(q);
  if (!found.empty) {
    const d = found.docs[0];
    return normalizePayment(d.id, d.data());
  }

  return null;
}

export function getFilterOptions(payments) {
  const methods = [...new Set(payments.map((p) => p.paymentMethod))];

  return {
    status: ["Successful", "Pending", "Failed"],
    paymentMethod: methods.length ? methods : ["UPI", "Card", "Wallet"],
    amount: ["Under ₹100", "₹100 - ₹500", "Above ₹500"],
  };
}

export function parseArrayParam(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value).split(",").filter(Boolean);
}
