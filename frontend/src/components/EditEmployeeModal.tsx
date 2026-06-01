"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Building2, Briefcase, AlertCircle } from "lucide-react";
import type { EmployeeRow } from "@/components/EmployeeTable";

interface EditEmployeeModalProps {
  employee: EmployeeRow;
  onClose: () => void;
  onSaved: () => void;
  onToast: (title: string, desc: string, type: "success" | "error") => void;
}

interface DeptOption {
  department_id: number;
  department_name: string;
}

interface PosOption {
  position_id: number;
  position_name: string;
}

export default function EditEmployeeModal({
  employee,
  onClose,
  onSaved,
  onToast,
}: EditEmployeeModalProps) {
  const { t } = useTranslation();

  const [firstName, setFirstName] = useState(employee.first_name || "");
  const [lastName, setLastName] = useState(employee.last_name || "");
  const [email, setEmail] = useState(employee.email || "");
  const [phone, setPhone] = useState(employee.phone_number || "");
  const [address, setAddress] = useState(employee.address || "");
  const [departmentId, setDepartmentId] = useState<number | string>(
    employee.department?.department_id ?? ""
  );
  const [positionId, setPositionId] = useState<number | string>(
    employee.position?.position_id ?? ""
  );

  const [departments, setDepartments] = useState<DeptOption[]>([]);
  const [positions, setPositions] = useState<PosOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingOpts, setLoadingOpts] = useState(true);

  const deptChanged =
    departmentId !== "" &&
    Number(departmentId) !== employee.department?.department_id;

  useEffect(() => {
    async function loadOptions() {
      try {
        const [deptRes, posRes] = await Promise.all([
          fetch("/api/departments", { credentials: "include" }),
          fetch("/api/positions", { credentials: "include" }),
        ]);
        if (deptRes.ok) setDepartments(await deptRes.json());
        if (posRes.ok) setPositions(await posRes.json());
      } catch {
        // keep defaults
      } finally {
        setLoadingOpts(false);
      }
    }
    loadOptions();
  }, []);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      onToast(t("common.error"), "First name, last name, and email are required.", "error");
      return;
    }

    if (
      firstName.trim().length > 50 ||
      lastName.trim().length > 50 ||
      email.trim().length > 100 ||
      phone.trim().length > 20 ||
      address.trim().length > 200
    ) {
      onToast(t("common.error"), "One or more fields exceed maximum allowed characters (Names: 50, Email: 100, Phone: 20, Address: 200).", "error");
      return;
    }

    setSaving(true);
    try {
      // 1. Update basic info via PATCH
      const patchBody: Record<string, any> = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone_number: phone.trim() || undefined,
        address: address.trim() || undefined,
        department_id: departmentId === "" ? undefined : Number(departmentId),
        position_id: positionId === "" ? undefined : Number(positionId),
      };

      const patchRes = await fetch(`/api/admin/employees/${employee.employee_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patchBody),
      });

      if (!patchRes.ok) throw new Error("PATCH failed");

      // 2. If department changed, explicitly transfer to handle manager cleanup
      if (deptChanged && departmentId !== "") {
        await fetch(`/api/admin/employees/${employee.employee_id}/transfer`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            department_id: Number(departmentId),
            position_id: positionId === "" ? undefined : Number(positionId),
          }),
        });
      }

      onToast(t("common.success"), t("editEmployee.successMessage"), "success");
      onSaved();
    } catch {
      onToast(t("common.error"), t("editEmployee.errorMessage"), "error");
    } finally {
      setSaving(false);
    }
  };

  const fullName = `${employee.first_name} ${employee.last_name}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden relative animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t("editEmployee.title")}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{fullName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Name fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                {t("editEmployee.firstName")}
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                maxLength={50}
                className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                {t("editEmployee.lastName")}
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                maxLength={50}
                className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              {t("editEmployee.email")}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={100}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Phone + Address */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                {t("editEmployee.phone")}
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={20}
                className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                {t("editEmployee.address")}
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                maxLength={200}
                className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Department + Position */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                {t("editEmployee.department")}
              </label>
              {loadingOpts ? (
                <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
              ) : (
                <select
                  value={departmentId}
                  onChange={(e) =>
                    setDepartmentId(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">-- {t("editEmployee.department")} --</option>
                  {departments.map((d) => (
                    <option key={d.department_id} value={d.department_id}>
                      {d.department_name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                {t("editEmployee.position")}
              </label>
              {loadingOpts ? (
                <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
              ) : (
                <select
                  value={positionId}
                  onChange={(e) =>
                    setPositionId(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">-- {t("editEmployee.position")} --</option>
                  {positions.map((p) => (
                    <option key={p.position_id} value={p.position_id}>
                      {p.position_name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Transfer hint */}
          {deptChanged && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{t("editEmployee.transferHint")}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t border-gray-100 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-lg transition-colors"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
          >
            {saving ? t("editEmployee.saving") : t("editEmployee.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
