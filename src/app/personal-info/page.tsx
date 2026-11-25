"use client";

import React, { useState, useEffect, useRef } from "react";
import Header from "@/components/common/Header";
import CityFooter from "@/components/common/CityFooter";
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  Image as ImageIcon,
  Check,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function PersonalInfoPage() {
  const { toast } = useToast();
  const [realName, setRealName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [nidNumber, setNidNumber] = useState("");
  const [frontPictureUrl, setFrontPictureUrl] = useState("");
  const [backPictureUrl, setBackPictureUrl] = useState("");
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState<string>("");

  // Files for upload
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string>("");
  const [backPreview, setBackPreview] = useState<string>("");

  const frontInputRef = useRef<HTMLInputElement | null>(null);
  const backInputRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadKyc = () => {
    setFetching(true);
    fetch("/api/user/kyc")
      .then((res) => res.json())
      .then((data) => {
        if (data?.kyc) {
          setRealName(data.kyc.realName || "");
          setAge(String(data.kyc.age || ""));
          setGender(data.kyc.gender || "Male");
          setNidNumber(data.kyc.nidNumber || "");
          setFrontPictureUrl(data.kyc.frontPictureUrl || "");
          setBackPictureUrl(data.kyc.backPictureUrl || "");
          setFrontPreview(data.kyc.frontPictureUrl || "");
          setBackPreview(data.kyc.backPictureUrl || "");
          setKycStatus(data.kyc.status || "pending");
          setAdminNote(data.kyc.adminNote || "");
        }
      })
      .catch(() => { })
      .finally(() => setFetching(false));
  };

  useEffect(() => {
    loadKyc();
  }, []);

  const handleFrontFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file (JPG, PNG).");
        return;
      }
      setFrontFile(file);
      setFrontPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleBackFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file (JPG, PNG).");
        return;
      }
      setBackFile(file);
      setBackPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!realName || !age || !gender || !nidNumber) {
      setError("Please fill in all personal information.");
      return;
    }

    if (!frontFile && !frontPictureUrl) {
      setError("Please select the Front picture of your National ID.");
      return;
    }

    if (!backFile && !backPictureUrl) {
      setError("Please select the Back picture of your National ID.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("realName", realName);
      formData.append("age", age);
      formData.append("gender", gender);
      formData.append("nidNumber", nidNumber);

      if (frontFile) {
        formData.append("frontPicture", frontFile);
      } else if (frontPictureUrl) {
        formData.append("frontPictureUrl", frontPictureUrl);
      }

      if (backFile) {
        formData.append("backPicture", backFile);
      } else if (backPictureUrl) {
        formData.append("backPictureUrl", backPictureUrl);
      }

      const res = await fetch("/api/user/kyc", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        const errMsg = data.error || "Submission failed.";
        setError(errMsg);
        toast.error(errMsg);
        setLoading(false);
        return;
      }

      const succMsg = data.message || "National ID documents submitted successfully for Admin review!";
      setSuccess(succMsg);
      toast.success(succMsg);
      setKycStatus("pending");
      if (data.kyc) {
        setFrontPictureUrl(data.kyc.frontPictureUrl || "");
        setBackPictureUrl(data.kyc.backPictureUrl || "");
      }
      setLoading(false);
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const isApproved = kycStatus === "approved";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020a1f] via-[#051338] to-[#01081a] text-white flex flex-col justify-between pb-28">
      <div>
        <Header title="Personal Information" showBack={true} />

        <div className="p-4 space-y-4 max-w-[420px] mx-auto">
          {/* Status Banners */}
          {kycStatus === "pending" && (
            <div className="p-3.5 bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs rounded-2xl shadow-sm flex items-start gap-2.5">
              <Clock size={18} className="text-[#f5ba31] flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Under Review: </span>
                Your National ID documents are currently pending review by Admin.
              </div>
            </div>
          )}

          {kycStatus === "approved" && (
            <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs rounded-2xl shadow-sm flex items-start gap-2.5">
              <ShieldCheck size={20} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Verified Account: </span>
                Your identity and National ID documents have been successfully approved by Admin.
              </div>
            </div>
          )}

          {kycStatus === "rejected" && (
            <div className="p-3.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs rounded-2xl shadow-sm flex items-start gap-2.5">
              <AlertCircle size={18} className="text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Verification Rejected: </span>
                {adminNote || "Please upload clear, legible photos of your National ID and re-submit."}
              </div>
            </div>
          )}

          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-red-950/70 border border-rose-300 dark:border-red-500/60 text-rose-800 dark:text-red-100 text-xs font-bold rounded-2xl text-center shadow-sm flex items-center justify-center gap-2">
              <AlertCircle size={18} className="shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-500/60 text-emerald-900 dark:text-emerald-100 text-xs font-bold rounded-2xl text-center shadow-sm flex items-center justify-center gap-2">
              <CheckCircle2 size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="p-5 rounded-3xl bg-[#04102e]/85 backdrop-blur-md border border-[#f5ba31]/30 shadow-lg space-y-4"
          >
            {/* Real Name */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Your Name
              </label>
              <input
                type="text"
                placeholder="Enter your Real Name"
                value={realName}
                onChange={(e) => setRealName(e.target.value)}
                disabled={isApproved}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#020a1f] border border-slate-700 text-sm font-semibold text-white outline-none focus:border-[#f5ba31] disabled:opacity-75"
                required
              />
            </div>

            {/* Age */}
            <div>
              <label className="block text-xs font-bold text-blue-900 mb-1">
                Age
              </label>
              <input
                type="number"
                placeholder="Enter your age (18-60 years)"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min={18}
                max={60}
                disabled={isApproved}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-blue-50/50 border border-blue-200 text-sm font-semibold text-gray-800 outline-none focus:border-blue-500 disabled:opacity-75"
                required
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-bold text-blue-900 mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                disabled={isApproved}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-blue-50/50 border border-blue-200 text-sm font-semibold text-gray-800 outline-none focus:border-blue-500 disabled:opacity-75"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* National ID */}
            <div>
              <label className="block text-xs font-bold text-blue-900 mb-1">
                National ID Number
              </label>
              <input
                type="text"
                placeholder="Enter your national ID number"
                value={nidNumber}
                onChange={(e) => setNidNumber(e.target.value)}
                disabled={isApproved}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-blue-50/50 border border-blue-200 text-sm font-semibold text-gray-800 outline-none focus:border-blue-500 disabled:opacity-75"
                required
              />
            </div>

            {/* Upload Front and Back Cards */}
            <div>
              <label className="block text-xs font-bold text-blue-900 mb-1.5">
                NID Card Photos (Cloudinary Saved)
              </label>

              {/* Hidden file inputs */}
              <input
                type="file"
                ref={frontInputRef}
                onChange={handleFrontFileChange}
                accept="image/*"
                className="hidden"
                disabled={isApproved}
              />
              <input
                type="file"
                ref={backInputRef}
                onChange={handleBackFileChange}
                accept="image/*"
                className="hidden"
                disabled={isApproved}
              />

              <div className="grid grid-cols-2 gap-3">
                {/* Front Card Box */}
                <div
                  onClick={() => !isApproved && frontInputRef.current?.click()}
                  className={`p-3 border-2 border-dashed rounded-2xl transition-all ${frontPreview
                    ? "border-emerald-400 bg-emerald-50/30"
                    : "border-blue-300 bg-blue-50/40 hover:bg-blue-50"
                    } text-center flex flex-col items-center justify-center cursor-pointer min-h-[120px] relative overflow-hidden group`}
                >
                  {frontPreview ? (
                    <div className="w-full flex flex-col items-center">
                      <div className="w-full h-20 rounded-xl overflow-hidden mb-1.5 bg-slate-900 relative">
                        <img
                          src={frontPreview}
                          alt="NID Front"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] text-white font-bold bg-black/60 px-2 py-0.5 rounded-full">
                            Change
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                        <Check size={12} className="text-emerald-600" />
                        Front Photo Ready
                      </span>
                    </div>
                  ) : (
                    <>
                      <Upload size={24} className="text-blue-500 mb-1" />
                      <span className="text-[11px] font-bold text-blue-900">
                        Upload Front Picture
                      </span>
                      <span className="text-[9px] text-gray-500 mt-0.5">
                        JPG, PNG (Max 5MB)
                      </span>
                    </>
                  )}
                </div>

                {/* Back Card Box */}
                <div
                  onClick={() => !isApproved && backInputRef.current?.click()}
                  className={`p-3 border-2 border-dashed rounded-2xl transition-all ${backPreview
                    ? "border-emerald-400 bg-emerald-50/30"
                    : "border-blue-300 bg-blue-50/40 hover:bg-blue-50"
                    } text-center flex flex-col items-center justify-center cursor-pointer min-h-[120px] relative overflow-hidden group`}
                >
                  {backPreview ? (
                    <div className="w-full flex flex-col items-center">
                      <div className="w-full h-20 rounded-xl overflow-hidden mb-1.5 bg-slate-900 relative">
                        <img
                          src={backPreview}
                          alt="NID Back"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] text-white font-bold bg-black/60 px-2 py-0.5 rounded-full">
                            Change
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                        <Check size={12} className="text-emerald-600" />
                        Back Photo Ready
                      </span>
                    </div>
                  ) : (
                    <>
                      <Upload size={24} className="text-blue-500 mb-1" />
                      <span className="text-[11px] font-bold text-blue-900">
                        Upload Back Picture
                      </span>
                      <span className="text-[9px] text-gray-500 mt-0.5">
                        JPG, PNG (Max 5MB)
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {!isApproved && (
              <button
                type="submit"
                disabled={loading}
                className="btn-gold-premium w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider shadow-md active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>Uploading to Cloudinary...</span>
                  </>
                ) : (
                  <span>{kycStatus === "rejected" ? "Re-submit NID" : "Submit NID for Review"}</span>
                )}
              </button>
            )}
          </form>
        </div>
      </div>

      <CityFooter />
    </div>
  );
}
