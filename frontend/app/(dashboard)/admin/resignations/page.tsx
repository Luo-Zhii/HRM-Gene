"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../../../../src/hooks/useAuth";
import { 
  Clock, CheckCircle2, XCircle, MoreHorizontal, LogOut, Check, X,
  ArrowRight, AlertCircle, HelpCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Employee = {
  employee_id: number;
  first_name: string;
  last_name: string;
  email: string;
};

type ResignationRequest = {
  id: number;
  requested_last_day: string;
  reason_text: string;
  status: string;
  created_at: string;
  employee: Employee;
};

export default function ResignationApprovalsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<ResignationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Approval Modal State (PURE TAILWIND)
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ResignationRequest | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchAllRequests();
  }, []);

  const fetchAllRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/resignations/all", {
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to fetch requests");
      const data = await res.json();
      setRequests(data);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not load resignation requests", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenApproveModal = (req: ResignationRequest) => {
    setSelectedRequest(req);
    setSelectedCategory(""); // Reset
    setIsApproveOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    if (!selectedCategory) {
      toast({ title: "Validation Error", description: "You must classify the resignation reason for analytics.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch(`/api/resignations/${selectedRequest.id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          status: "Approved",
          resignation_category: selectedCategory
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to approve request");

      toast({ title: "Approved", description: `Successfully approved resignation for ${selectedRequest.employee.first_name} ${selectedRequest.employee.last_name}. Their status has been terminated.` });
      setIsApproveOpen(false);
      fetchAllRequests();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (id: number) => {
    if (!window.confirm("Are you sure you want to reject this resignation request?")) return;
    
    try {
      const res = await fetch(`/api/resignations/${id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status: "Rejected" })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reject request");

      toast({ title: "Rejected", description: "The request has been rejected." });
      fetchAllRequests();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved": return <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200 uppercase tracking-tighter"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</span>;
      case "Rejected": return <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold border border-red-200 uppercase tracking-tighter"><XCircle className="w-3 h-3 mr-1" /> Rejected</span>;
      case "Withdrawn": return <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold border border-gray-200 uppercase tracking-tighter">Withdrawn</span>;
      default: return <span className="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold border border-amber-200 uppercase tracking-tighter"><Clock className="w-3 h-3 mr-1" /> Pending</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Resignation Approvals</h1>
          <p className="text-gray-500 mt-1 font-medium">Review employee resignation requests, classify exit reasons for analytics, and process offboarding.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
          <h2 className="text-lg font-black text-gray-800 uppercase tracking-widest italic">Pending & History</h2>
          <button onClick={fetchAllRequests} className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest">Refresh Data</button>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center text-gray-400 gap-4">
               <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
               <span className="font-bold text-sm uppercase tracking-widest">Accessing records...</span>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-20 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
                <LogOut size={40} />
              </div>
              <h3 className="text-gray-900 font-black text-xl">No requests detected</h3>
              <p className="text-gray-500 mt-2 max-w-sm">The digital resignation queue is currently empty. All clear!</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-[#F8FAFC] border-b border-gray-100">
                <tr>
                  <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] italic">Employee</th>
                  <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] italic">Submitted</th>
                  <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] italic">Requested Last Day</th>
                  <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] italic">Handover Notes</th>
                  <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] italic">Status</th>
                  <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] italic text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {requests.map((req) => (
                  <tr key={req.id} className="group hover:bg-blue-50/20 transition-colors">
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="font-black text-gray-800 tracking-tight">
                        {req.employee ? `${req.employee.first_name} ${req.employee.last_name}` : "Unknown"}
                      </div>
                      <div className="text-xs text-gray-400 font-bold mt-0.5 italic">{req.employee?.email}</div>
                    </td>
                    <td className="px-6 py-6 text-gray-500 text-sm font-bold">
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-6 font-black text-gray-700 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                         <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 italic">
                            {new Date(req.requested_last_day).toLocaleDateString()}
                         </span>
                      </div>
                    </td>
                    <td className="px-6 py-6 max-w-xs">
                      <p className="text-sm text-gray-500 font-bold italic line-clamp-2" title={req.reason_text}>
                        {req.reason_text}
                      </p>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="px-6 py-6 text-right whitespace-nowrap">
                      {req.status === "Pending" ? (
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                            onClick={() => handleOpenApproveModal(req)}
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button 
                            className="text-red-600 bg-white border-2 border-red-50 hover:bg-red-50 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95"
                            onClick={() => handleReject(req.id)}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-300 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 border border-gray-50 rounded-xl italic">Archived</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* PURE TAILWIND APPROVAL MODAL */}
      {isApproveOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden relative animate-in zoom-in-95 duration-200 border border-gray-100">
            {/* Close Button */}
            <button
              onClick={() => setIsApproveOpen(false)}
              className="absolute top-8 right-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-all"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header */}
            <div className="p-10 pb-6">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                 <LogOut size={32} />
              </div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Approve Resignation</h2>
              <p className="text-gray-500 mt-2 font-medium leading-relaxed">
                You are about to terminate <strong className="text-gray-900">{selectedRequest?.employee ? `${selectedRequest.employee.first_name} ${selectedRequest.employee.last_name}` : ''}</strong>'s active contract permanently.
              </p>
            </div>

            {/* Info Summary */}
            <div className="px-10 py-6 bg-gray-50/80 border-y border-gray-100 space-y-3">
               <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest italic">Target Last Day</span>
                  <span className="text-sm font-black text-blue-700">{selectedRequest ? new Date(selectedRequest.requested_last_day).toLocaleDateString() : ''}</span>
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest italic">Email Address</span>
                  <span className="text-sm font-bold text-gray-600">{selectedRequest?.employee?.email}</span>
               </div>
            </div>

            {/* Categorization Field */}
            <div className="p-10 space-y-6">
               <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-black text-gray-700 uppercase tracking-widest italic ml-1">
                     <AlertCircle size={16} className="text-amber-500" />
                     Reason Classification *
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full h-14 px-6 bg-white border-2 border-gray-100 rounded-2xl text-gray-800 font-bold focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer outline-none"
                      style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.5rem center', backgroundSize: '1.25rem' }}
                    >
                      <option value="" disabled className="text-gray-400">Select categorization for analytics...</option>
                      <option value="Compensation">Compensation & Benefits</option>
                      <option value="Culture">Company Culture & Environment</option>
                      <option value="Personal">Personal / Family Reasons</option>
                      <option value="Other">Other / Unspecified</option>
                    </select>
                  </div>
                  <p className="text-[11px] text-gray-400 font-bold ml-1 italic">* This data is required for the System Analytics Dashboard reports.</p>
               </div>

               {/* Action Footer */}
               <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsApproveOpen(false)}
                    disabled={isProcessing}
                    className="flex-1 h-14 bg-gray-50 hover:bg-gray-100 text-gray-500 text-sm font-black uppercase tracking-widest rounded-2xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="flex-[2] h-14 bg-red-600 hover:bg-red-700 text-white text-sm font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-red-600/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Check size={18} strokeWidth={3} />
                        Confirm & Terminate
                      </>
                    )}
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
