"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/common/Header";
import CityFooter from "@/components/common/CityFooter";
import { Upload, CheckCircle2, AlertCircle } from "lucide-react";

export default function PersonalInfoPage() {
  const [realName, setRealName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [nidNumber, setNidNumber] = useState("");
  const [frontPictureUrl, setFrontPictureUrl] = useState("");
  const [backPictureUrl, setBackPictureUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/user/kyc")
      .then((res) => res.json())
      .then((data) => {
        if (data?.kyc) {
          setRealName(data.kyc.realName);
          setAge(String(data.kyc.age));
          setGender(data.kyc.gender);
          setNidNumber(data.kyc.nidNumber);
          setFrontPictureUrl(data.kyc.frontPictureUrl || "");
          setBackPictureUrl(data.kyc.backPictureUrl || "");
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!realName || !age || !gender || !nidNumber) {
      setError("Please fill in all personal information.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/user/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          realName,
          age: Number(age),
          gender,
          nidNumber,
          frontPictureUrl: frontPictureUrl || "https://placehold.co/400x250/png?text=NID+Front",
          backPictureUrl: backPictureUrl || "https://placehold.co/400x250/png?text=NID+Back",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Submission failed.");
        setLoading(false);
        return;
      }

      setSuccess("Personal Information submitted successfully for review!");
      setLoading(false);
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#bde2ff] via-[#ebf5fe] to-[#cfe7fe] flex flex-col justify-between">
      <div>
        <Header title="Personal Information" showBack={true} />

        <div className="p-4 space-y-4 max-w-[400px] mx-auto">
          {error && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-700 text-xs font-semibold rounded-xl text-center shadow-sm flex items-center justify-center gap-1.5">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-xl text-center shadow-sm flex items-center justify-center gap-1.5">
              <CheckCircle2 size={16} />
              <span>{success}</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="p-5 rounded-3xl bg-white shadow-md border border-blue-200 space-y-4"
          >
            {/* Real Name */}
            <div>
              <label className="block text-xs font-bold text-blue-900 mb-1">
                Your Name
              </label>
              <input
                type="text"
                placeholder="Enter your Real Name"
                value={realName}
                onChange={(e) => setRealName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-blue-50/50 border border-blue-200 text-sm font-semibold text-gray-800 outline-none focus:border-blue-500"
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
                className="w-full px-3.5 py-2.5 rounded-2xl bg-blue-50/50 border border-blue-200 text-sm font-semibold text-gray-800 outline-none focus:border-blue-500"
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
                className="w-full px-3.5 py-2.5 rounded-2xl bg-blue-50/50 border border-blue-200 text-sm font-semibold text-gray-800 outline-none focus:border-blue-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* National ID */}
            <div>
              <label className="block text-xs font-bold text-blue-900 mb-1">
                National ID
              </label>
              <input
                type="text"
                placeholder="Enter your national ID number."
                value={nidNumber}
                onChange={(e) => setNidNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-blue-50/50 border border-blue-200 text-sm font-semibold text-gray-800 outline-none focus:border-blue-500"
                required
              />
            </div>

            {/* Upload Front and Back Cards */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 border-2 border-dashed border-blue-300 rounded-2xl bg-blue-50/40 text-center flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50">
                <Upload size={24} className="text-blue-500 mb-1" />
                <span className="text-[11px] font-bold text-blue-900">
                  Upload Front Picture
                </span>
              </div>

              <div className="p-3 border-2 border-dashed border-blue-300 rounded-2xl bg-blue-50/40 text-center flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50">
                <Upload size={24} className="text-blue-500 mb-1" />
                <span className="text-[11px] font-bold text-blue-900">
                  Upload Back Picture
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-base shadow-md active:scale-98 transition-all disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      </div>

      <CityFooter />
    </div>
  );
}

