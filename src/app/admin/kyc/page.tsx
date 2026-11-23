"use client";

import React, { useEffect, useState } from "react";
import {
  Check,
  X,
  Search,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  AlertCircle,
} from "lucide-react";

interface KycItem {
  _id: string;
  userId: string;
  userPhone: string;
  userNickname: string;
  realName: string;
  age: number;
  gender: string;
  nidNumber: string;
  frontPictureUrl: string;
  backPictureUrl: string;
  status: "pending" | "approved" | "rejected";
  adminNote?: string;
  createdAt: string;
  reviewedAt?: string;
}

export default function AdminKycPage() {
  const [kycs, setKycs] = useState<KycItem[]>([]);
  const [filter, setFilter] = useState<string>("pending");
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchKycs = () => {
    setLoading(true);
    fetch(`/api/admin/kyc?status=${filter}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.kycs) setKycs(data.kycs);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchKycs();
  }, [filter]);

  const handleAction = async (kycId: string, action: "approve" | "reject") => {
    let note = "";
    if (action === "reject") {
      const input = prompt("Reason for rejection (optional):");
      if (input === null) return; // user cancelled prompt
      note = input;
    } else {
      if (!confirm("Approve this user's KYC verification?")) return;
    }

    setActionLoading(kycId);

    try {
      const res = await fetch("/api/admin/kyc", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kycId, action, adminNote: note }),
      });

      if (res.ok) {
        fetchKycs();
      } else {
        const data = await res.json();
        alert(data.error || "Action failed.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredKycs = kycs.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.realName?.toLowerCase().includes(q) ||
      item.nidNumber?.toLowerCase().includes(q) ||
      item.userPhone?.toLowerCase().includes(q) ||
      item.userNickname?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <UserCheck className="text-blue-500" size={26} />
            KYC Verification Review
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review user national IDs, real names, ages, and approve or reject submissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {["pending", "approved", "rejected", "all"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                filter === tab
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
          <button
            onClick={fetchKycs}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Search by name, phone, or NID number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* KYC Submissions Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs flex flex-col items-center gap-2">
          <RefreshCw className="animate-spin text-blue-500" size={24} />
          <span>Loading KYC submissions...</span>
        </div>
      ) : filteredKycs.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-xs bg-slate-900/50 rounded-2xl border border-slate-800">
          No KYC submissions found for this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredKycs.map((item) => (
            <div
              key={item._id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-sm"
            >
              {/* Header info */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-base">
                      {item.realName}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        item.status === "approved"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : item.status === "rejected"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    User: {item.userNickname} ({item.userPhone})
                  </div>
                </div>

                <span className="text-[10px] text-slate-500">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Identity Details */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-800/60 rounded-xl text-xs">
                <div>
                  <div className="text-[10px] text-slate-400">NID Number</div>
                  <div className="font-bold text-slate-200">{item.nidNumber}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Age</div>
                  <div className="font-bold text-slate-200">{item.age} yrs</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Gender</div>
                  <div className="font-bold text-slate-200">{item.gender}</div>
                </div>
              </div>

              {/* NID Card Photo Previews */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 mb-1.5">
                  ID Card Photos:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div
                    onClick={() => setPreviewImage(item.frontPictureUrl)}
                    className="group relative cursor-pointer border border-slate-700 rounded-xl overflow-hidden bg-slate-800 aspect-[16/10] flex items-center justify-center"
                  >
                    {item.frontPictureUrl ? (
                      <img
                        src={item.frontPictureUrl}
                        alt="NID Front"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <span className="text-[10px] text-slate-500">No Front Pic</span>
                    )}
                    <span className="absolute bottom-1 right-1 bg-black/70 text-[9px] px-1.5 py-0.5 rounded text-white font-medium">
                      Front
                    </span>
                  </div>

                  <div
                    onClick={() => setPreviewImage(item.backPictureUrl)}
                    className="group relative cursor-pointer border border-slate-700 rounded-xl overflow-hidden bg-slate-800 aspect-[16/10] flex items-center justify-center"
                  >
                    {item.backPictureUrl ? (
                      <img
                        src={item.backPictureUrl}
                        alt="NID Back"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <span className="text-[10px] text-slate-500">No Back Pic</span>
                    )}
                    <span className="absolute bottom-1 right-1 bg-black/70 text-[9px] px-1.5 py-0.5 rounded text-white font-medium">
                      Back
                    </span>
                  </div>
                </div>
              </div>

              {item.adminNote && (
                <div className="text-xs text-rose-300 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                  <span className="font-bold">Note: </span>
                  {item.adminNote}
                </div>
              )}

              {/* Action Buttons */}
              {item.status === "pending" && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <button
                    disabled={actionLoading === item._id}
                    onClick={() => handleAction(item._id, "approve")}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors disabled:opacity-50"
                  >
                    <Check size={14} />
                    <span>Approve</span>
                  </button>
                  <button
                    disabled={actionLoading === item._id}
                    onClick={() => handleAction(item._id, "reject")}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors disabled:opacity-50"
                  >
                    <X size={14} />
                    <span>Reject</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-xl w-full bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden p-3 relative"
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"
            >
              <X size={18} />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="w-full max-h-[70vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}

