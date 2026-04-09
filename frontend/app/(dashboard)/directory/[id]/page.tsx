"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Mail,
  Phone,
  Briefcase,
  Building2,
  ArrowLeft,
  User,
} from "lucide-react";

interface PublicEmployee {
  employee_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  avatar_url?: string;
  department?: { department_name: string };
  position?: { position_name: string };
}

export default function DirectoryProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [employee, setEmployee] = useState<PublicEmployee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`/api/employees/${id}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setEmployee(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
            <User size={28} className="text-gray-400" />
          </div>
          <p className="text-gray-700 font-semibold">Employee not found</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-blue-600 hover:underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const fullName = `${employee.first_name} ${employee.last_name}`.trim();
  const initials =
    `${employee.first_name?.[0] ?? ""}${employee.last_name?.[0] ?? ""}`.toUpperCase();

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-8 group transition-colors"
      >
        <ArrowLeft
          size={16}
          className="group-hover:-translate-x-0.5 transition-transform"
        />
        Back
      </button>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header band */}
        <div className="h-24 bg-gradient-to-r from-blue-500 to-blue-700 relative" />

        {/* Avatar + Name */}
        <div className="px-8 pb-8">
          <div className="-mt-12 mb-5">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white font-bold text-3xl shadow-lg border-4 border-white overflow-hidden">
              {employee.avatar_url ? (
                <img
                  src={employee.avatar_url}
                  alt={fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{initials || <User size={32} />}</span>
              )}
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>

          {employee.position?.position_name && (
            <p className="text-blue-600 font-medium text-sm mt-0.5">
              {employee.position.position_name}
            </p>
          )}

          {employee.department?.department_name && (
            <span className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
              <Building2 size={11} />
              {employee.department.department_name}
            </span>
          )}

          {/* Divider */}
          <div className="border-t border-gray-100 my-6" />

          {/* Contact Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <Mail size={16} className="text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Email
                </p>
                <p className="text-sm font-medium text-gray-800">
                  {employee.email}
                </p>
              </div>
            </div>

            {employee.phone_number && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                  <Phone size={16} className="text-green-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Phone
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    {employee.phone_number}
                  </p>
                </div>
              </div>
            )}

            {employee.position?.position_name && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                  <Briefcase size={16} className="text-purple-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Position
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    {employee.position.position_name}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8">
            <a
              href={`mailto:${employee.email}`}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl px-5 py-2.5 transition-colors shadow-sm shadow-blue-200"
            >
              <Mail size={15} />
              Send Email
            </a>
            <button
              onClick={() => router.push("/dashboard")}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-sm rounded-xl px-5 py-2.5 transition-colors border border-gray-200"
            >
              <ArrowLeft size={15} />
              Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
