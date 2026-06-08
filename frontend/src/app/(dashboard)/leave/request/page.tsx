"use client";
import React, { useState } from "react";
import { DatePicker } from "@/components/ui/datepicker";

export default function LeaveRequestPage() {
  const [leaveType, setLeaveType] = useState("1");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const parseLocalDate = (dateStr: string) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const submit = async () => {
    const body = {
      employeeId: 1,
      leaveTypeId: parseInt(leaveType, 10),
      startDate,
      endDate,
      reason,
    };
    const res = await fetch("/api/leave/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    alert(JSON.stringify(json));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Submit Leave Request</h1>
      <div className="mt-4 space-y-3 max-w-md">
        <label className="block">
          Leave Type
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            className="ml-2"
          >
            <option value="1">Annual Leave</option>
            <option value="2">Sick Leave</option>
          </select>
        </label>
        <div className="block">
          Start Date
          <DatePicker
            selected={parseLocalDate(startDate)}
            onSelect={(date) => setStartDate(date ? getLocalDateString(date) : "")}
            maxDate={parseLocalDate(endDate) || undefined}
            className="ml-2 w-full border p-2"
          />
        </div>
        <div className="block">
          End Date
          <DatePicker
            selected={parseLocalDate(endDate)}
            onSelect={(date) => setEndDate(date ? getLocalDateString(date) : "")}
            minDate={parseLocalDate(startDate) || undefined}
            className="ml-2 w-full border p-2"
          />
        </div>
        <label className="block">
          Reason
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full mt-1"
          />
        </label>
        <button
          onClick={submit}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
