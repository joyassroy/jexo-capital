"use client";

import React, { useState, useEffect, useRef } from "react";
import Header from "@/components/common/Header";
import CityFooter from "@/components/common/CityFooter";
import { useTheme } from "@/context/ThemeContext";
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

// Helper to safely convert file to base64 Data URL
function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || "");
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    } catch {
      resolve("");
    }
  });
}

// Helper to compress camera images on mobile before uploading to prevent Vercel 4.5MB payload limit
function compressImage(file: File, maxWidth = 1280, quality = 0.8): Promise<File> {
  return new Promise((resolve) => {
    try {
      if (file.size <= 400 * 1024) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        try {
          const img = new window.Image();
          img.src = event.target?.result as string;
          img.onload = () => {
            try {
              let width = img.width;
              let height = img.height;

              if (width > maxWidth || height > maxWidth) {
                if (width > height) {
                  height = Math.round((height * maxWidth) / width);
                  width = maxWidth;
                } else {
                  width = Math.round((width * maxWidth) / height);
                  height = maxWidth;
                }
              }

              const canvas = document.createElement("canvas");
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext("2d");
              if (!ctx) {
                resolve(file);
                return;
              }

              ctx.drawImage(img, 0, 0, width, height);
              canvas.toBlob(
                (blob) => {
                  if (blob) {
                    const compressedFile = new File(
                      [blob],
                      file.name.replace(/\.[^.]+$/, ".jpg"),
                      {
                        type: "image/jpeg",
                        lastModified: Date.now(),
                      }
                    );
                    resolve(compressedFile);
                  } else {
                    resolve(file);
                  }
                },
                "image/jpeg",
                quality
              );
            } catch {
              resolve(file);
            }
          };
          img.onerror = () => resolve(file);
        } catch {
          resolve(file);
        }
      };
      reader.onerror = () => resolve(file);
    } catch {
      resolve(file);
    }
  });
}

export default function PersonalInfoPage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
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
    setMounted(true);
    loadKyc();
  }, []);

  const isLight = mounted && theme === "light";

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
      // Compress camera photos on mobile before uploading to prevent Vercel 4.5MB payload limit
      let processedFront = frontFile;
      let processedBack = backFile;
      if (frontFile) {
        processedFront = await compressImage(frontFile);
      }
      if (backFile) {
        processedBack = await compressImage(backFile);
      }

      const formData = new FormData();
      formData.append("realName", realName);
      formData.append("age", age);
      formData.append("gender", gender);
      formData.append("nidNumber", nidNumber);

      if (processedFront) {
        formData.append("frontPicture", processedFront);
        try {
          const frontB64 = await fileToDataUrl(processedFront);
          if (frontB64) formData.append("frontPictureBase64", frontB64);
        } catch { }
      } else if (frontPictureUrl) {
        formData.append("frontPictureUrl", frontPictureUrl);
      }

      if (processedBack) {
        formData.append("backPicture", processedBack);
        try {
          const backB64 = await fileToDataUrl(processedBack);
          if (backB64) formData.append("backPictureBase64", backB64);
        } catch { }
      } else if (backPictureUrl) {
        formData.append("backPictureUrl", backPictureUrl);
      }

      const res = await fetch("/api/user/kyc", {
        method: "POST",
        body: formData,
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Server responded with error status ${res.status}`);
      }

      if (!res.ok) {
        const errMsg = data.error || "Submission failed. Please check your information.";
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
    } catch (err: any) {
      console.error("KYC submission error:", err);
      const message = err?.message || "An unexpected error occurred. Please try again.";
      setError(message);
      toast.error(message);
      setLoading(false);
    }
  };

  const isApproved = kycStatus === "approved";

  return (
    <div
      className={`min-h-screen flex flex-col justify-between pb-28 transition-colors duration-200 ${
        isLight
          ? "bg-slate-50 text-slate-800"
          : "bg-gradient-to-b from-[#020a1f] via-[#051338] to-[#01081a] text-white"
      }`}
    >
      <div>
        <Header title="Personal Information" showBack={true} />

        <div className="p-4 space-y-4 max-w-[420px] mx-auto">
          {/* Status Banners */}
          {kycStatus === "pending" && (
            <div
              className={`p-3.5 rounded-2xl shadow-xs flex items-start gap-2.5 transition-colors border-2 ${
                isLight
                  ? "bg-amber-100/95 border-amber-400 text-amber-950"
                  : "bg-amber-950/60 border-amber-500/70 text-amber-100"
              }`}
            >
              <Clock
                size={20}
                className={`flex-shrink-0 mt-0.5 ${
                  isLight ? "text-amber-800" : "text-amber-400"
                }`}
              />
              <div
                className={`text-xs leading-relaxed ${
                  isLight ? "text-amber-950" : "text-amber-100"
                }`}
              >
                <span
                  className={`font-black tracking-wide ${
                    isLight ? "text-amber-950" : "text-amber-300"
                  }`}
                >
                  Under Review:{" "}
                </span>
                <span className={isLight ? "text-amber-950 font-bold" : "text-amber-200 font-medium"}>
                  Your National ID documents are currently pending review by Admin.
                </span>
              </div>
            </div>
          )}

          {kycStatus === "approved" && (
            <div
              className={`p-3.5 rounded-2xl shadow-xs flex items-start gap-2.5 transition-colors border-2 ${
                isLight
                  ? "bg-emerald-100/95 border-emerald-400 text-emerald-950"
                  : "bg-emerald-950/60 border-emerald-500/70 text-emerald-100"
              }`}
            >
              <ShieldCheck
                size={21}
                className={`flex-shrink-0 mt-0.5 ${
                  isLight ? "text-emerald-800" : "text-emerald-400"
                }`}
              />
              <div
                className={`text-xs leading-relaxed ${
                  isLight ? "text-emerald-950" : "text-emerald-100"
                }`}
              >
                <span
                  className={`font-black tracking-wide ${
                    isLight ? "text-emerald-950" : "text-emerald-300"
                  }`}
                >
                  Verified Account:{" "}
                </span>
                <span className={isLight ? "text-emerald-950 font-bold" : "text-emerald-200 font-medium"}>
                  Your identity and National ID documents have been successfully approved by Admin.
                </span>
              </div>
            </div>
          )}

          {kycStatus === "rejected" && (
            <div
              className={`p-3.5 rounded-2xl shadow-xs flex items-start gap-2.5 transition-colors border-2 ${
                isLight
                  ? "bg-rose-100/95 border-rose-400 text-rose-950"
                  : "bg-rose-950/60 border-rose-500/70 text-rose-100"
              }`}
            >
              <AlertCircle
                size={20}
                className={`flex-shrink-0 mt-0.5 ${
                  isLight ? "text-rose-800" : "text-rose-400"
                }`}
              />
              <div
                className={`text-xs leading-relaxed ${
                  isLight ? "text-rose-950" : "text-rose-100"
                }`}
              >
                <span
                  className={`font-black tracking-wide ${
                    isLight ? "text-rose-950" : "text-rose-300"
                  }`}
                >
                  Verification Rejected:{" "}
                </span>
                <span className={isLight ? "text-rose-950 font-bold" : "text-rose-200 font-medium"}>
                  {adminNote || "Please upload clear, legible photos of your National ID and re-submit."}
                </span>
              </div>
            </div>
          )}

          {error && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-bold text-center shadow-xs flex items-center justify-center gap-2 ${
                isLight
                  ? "bg-rose-50 border border-rose-300 text-rose-800"
                  : "bg-red-950/70 border border-red-500/60 text-red-100"
              }`}
            >
              <AlertCircle size={18} className="shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-bold text-center shadow-xs flex items-center justify-center gap-2 ${
                isLight
                  ? "bg-emerald-50 border border-emerald-300 text-emerald-900"
                  : "bg-emerald-950/70 border border-emerald-500/60 text-emerald-100"
              }`}
            >
              <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className={`p-5 rounded-3xl transition-all shadow-md space-y-4 ${
              isLight
                ? "bg-white border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
                : "bg-[#04102e]/85 backdrop-blur-md border border-[#f5ba31]/30 shadow-lg"
            }`}
          >
            {/* Real Name */}
            <div>
              <label
                className={`block text-xs font-bold mb-1.5 ${
                  isLight ? "text-slate-700" : "text-slate-300"
                }`}
              >
                Your Name
              </label>
              <input
                type="text"
                placeholder="Enter your Real Name"
                value={realName}
                onChange={(e) => setRealName(e.target.value)}
                disabled={isApproved}
                className={`w-full px-3.5 py-2.5 rounded-2xl text-sm font-semibold outline-none transition-all disabled:opacity-75 ${
                  isLight
                    ? "bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                    : "bg-[#020a1f] border border-slate-700 text-white placeholder-slate-500 focus:border-[#f5ba31] focus:ring-2 focus:ring-[#f5ba31]/20"
                }`}
                required
              />
            </div>

            {/* Age */}
            <div>
              <label
                className={`block text-xs font-bold mb-1.5 ${
                  isLight ? "text-slate-700" : "text-slate-300"
                }`}
              >
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
                className={`w-full px-3.5 py-2.5 rounded-2xl text-sm font-semibold outline-none transition-all disabled:opacity-75 ${
                  isLight
                    ? "bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                    : "bg-[#020a1f] border border-slate-700 text-white placeholder-slate-500 focus:border-[#f5ba31] focus:ring-2 focus:ring-[#f5ba31]/20"
                }`}
                required
              />
            </div>

            {/* Gender */}
            <div>
              <label
                className={`block text-xs font-bold mb-1.5 ${
                  isLight ? "text-slate-700" : "text-slate-300"
                }`}
              >
                Gender
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["Male", "Female", "Other"] as const).map((g) => {
                  const isSelected = gender === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      disabled={isApproved}
                      onClick={() => setGender(g)}
                      className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all border ${
                        isSelected
                          ? "bg-gradient-to-r from-[#ffe58f] via-[#f5ba31] to-[#d48b06] text-slate-950 font-black border-amber-300 shadow-xs"
                          : isLight
                            ? "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/80"
                            : "bg-[#020a1f] text-slate-300 border-slate-700 hover:border-slate-600"
                      } disabled:opacity-75`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* National ID */}
            <div>
              <label
                className={`block text-xs font-bold mb-1.5 ${
                  isLight ? "text-slate-700" : "text-slate-300"
                }`}
              >
                National ID Number
              </label>
              <input
                type="text"
                placeholder="Enter your national ID number"
                value={nidNumber}
                onChange={(e) => setNidNumber(e.target.value)}
                disabled={isApproved}
                className={`w-full px-3.5 py-2.5 rounded-2xl text-sm font-semibold outline-none transition-all disabled:opacity-75 ${
                  isLight
                    ? "bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                    : "bg-[#020a1f] border border-slate-700 text-white placeholder-slate-500 focus:border-[#f5ba31] focus:ring-2 focus:ring-[#f5ba31]/20"
                }`}
                required
              />
            </div>

            {/* Upload Front and Back Cards */}
            <div>
              <label
                className={`block text-xs font-bold mb-1.5 ${
                  isLight ? "text-slate-700" : "text-slate-300"
                }`}
              >
                NID Card Photos (Front & Back)
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
                  className={`p-3 border-2 border-dashed rounded-2xl transition-all ${
                    frontPreview
                      ? isLight
                        ? "border-emerald-400 bg-emerald-50/70"
                        : "border-emerald-500/60 bg-emerald-950/30"
                      : isLight
                        ? "border-slate-300 bg-slate-50 hover:bg-slate-100/80"
                        : "border-slate-700 bg-[#020a1f]/80 hover:bg-[#020a1f]"
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
                      <span
                        className={`text-[10px] font-bold flex items-center gap-1 ${
                          isLight ? "text-emerald-700" : "text-emerald-400"
                        }`}
                      >
                        <Check size={12} className={isLight ? "text-emerald-600" : "text-emerald-400"} />
                        Front Photo Ready
                      </span>
                    </div>
                  ) : (
                    <>
                      <Upload size={24} className={`mb-1 ${isLight ? "text-amber-500" : "text-amber-400"}`} />
                      <span className={`text-[11px] font-bold ${isLight ? "text-slate-800" : "text-slate-200"}`}>
                        Upload Front Picture
                      </span>
                      <span className={`text-[9px] mt-0.5 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                        JPG, PNG (Max 5MB)
                      </span>
                    </>
                  )}
                </div>

                {/* Back Card Box */}
                <div
                  onClick={() => !isApproved && backInputRef.current?.click()}
                  className={`p-3 border-2 border-dashed rounded-2xl transition-all ${
                    backPreview
                      ? isLight
                        ? "border-emerald-400 bg-emerald-50/70"
                        : "border-emerald-500/60 bg-emerald-950/30"
                      : isLight
                        ? "border-slate-300 bg-slate-50 hover:bg-slate-100/80"
                        : "border-slate-700 bg-[#020a1f]/80 hover:bg-[#020a1f]"
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
                      <span
                        className={`text-[10px] font-bold flex items-center gap-1 ${
                          isLight ? "text-emerald-700" : "text-emerald-400"
                        }`}
                      >
                        <Check size={12} className={isLight ? "text-emerald-600" : "text-emerald-400"} />
                        Back Photo Ready
                      </span>
                    </div>
                  ) : (
                    <>
                      <Upload size={24} className={`mb-1 ${isLight ? "text-amber-500" : "text-amber-400"}`} />
                      <span className={`text-[11px] font-bold ${isLight ? "text-slate-800" : "text-slate-200"}`}>
                        Upload Back Picture
                      </span>
                      <span className={`text-[9px] mt-0.5 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
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
                    <span>Uploading NID Photos...</span>
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
