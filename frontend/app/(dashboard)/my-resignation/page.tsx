"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../../src/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/datepicker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Clock, CheckCircle2, XCircle, LogOut } from "lucide-react";

type ResignationRequest = {
  id: number;
  requested_last_day: string;
  reason_text: string;
  status: string;
  created_at: string;
};

export default function MyResignationPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<ResignationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("submit");

  // Form State
  const [requestedLastDay, setRequestedLastDay] = useState<Date | undefined>();
  const [reasonText, setReasonText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      const res = await fetch("/api/resignations/my", {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestedLastDay) {
      toast({ title: "Validation Error", description: "Please select your requested last day of work", variant: "destructive" });
      return;
    }
    if (!reasonText.trim()) {
      toast({ title: "Validation Error", description: "Please provide a reason or handover notes", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      // Create date format YYYY-MM-DD avoiding timezone offsets shifting the day
      const year = requestedLastDay.getFullYear();
      const month = String(requestedLastDay.getMonth() + 1).padStart(2, '0');
      const day = String(requestedLastDay.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      const res = await fetch("/api/resignations", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          requested_last_day: formattedDate,
          reason_text: reasonText
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to submit resignation");
      }

      toast({ title: "Success", description: "Your resignation request has been successfully submitted." });
      setRequestedLastDay(undefined);
      setReasonText("");
      await fetchMyRequests();
      setActiveTab("history"); // Switch to history tab automatically

    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved": return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</Badge>;
      case "Rejected": return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-0"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      case "Withdrawn": return <Badge variant="outline" className="text-gray-500">Withdrawn</Badge>;
      default: return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-0"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    }
  };

  // Check if they already have a pending/approved resignation
  const activeRequest = requests.find(r => r.status === 'Pending' || r.status === 'Approved');

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Resignation</h1>
        <p className="text-gray-500 mt-1">Submit your formal notice and track your offboarding request.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 bg-white border border-gray-100 p-1 shadow-sm rounded-lg">
          <TabsTrigger value="submit" className="rounded-md data-[state=active]:bg-gray-50 data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Submit Notice</TabsTrigger>
          <TabsTrigger value="history" className="rounded-md data-[state=active]:bg-gray-50 data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Tracking & History</TabsTrigger>
        </TabsList>

        <TabsContent value="submit" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <LogOut className="w-5 h-5 text-gray-500" />
                Formal Resignation Notice
              </CardTitle>
              <CardDescription>
                Once submitted securely, your request will be reviewed by HR. Please ensure your requested last day provides sufficient handover time according to your contract.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {activeRequest ? (
                <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-xl text-center">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">You have an active resignation request</h3>
                  <p className="text-gray-500 mt-2 max-w-md mx-auto">
                    You currently have a request in <strong className="text-gray-700">{activeRequest.status}</strong> status. 
                    You cannot submit another notice while one is already active. Please check the tracking history.
                  </p>
                  <Button variant="outline" className="mt-6" onClick={() => setActiveTab('history')}>View Request Tracking</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium text-sm">Requested Last Day of Work <span className="text-red-500">*</span></Label>
                    <div className="w-full sm:w-[280px]">
                      <DatePicker
                        selected={requestedLastDay}
                        onSelect={setRequestedLastDay}
                        placeholderText="Select last day"
                      />
                    </div>
                    <p className="text-[13px] text-gray-500">Pick the final date you intend to be employed.</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium text-sm">Reason / Handover Notes <span className="text-red-500">*</span></Label>
                    <Textarea 
                      placeholder="Please provide details regarding your resignation, expected handover plan, and any other notes for HR and your Manager."
                      className="min-h-[150px] resize-none focus:ring-blue-500"
                      value={reasonText}
                      onChange={(e) => setReasonText(e.target.value)}
                    />
                  </div>

                  <div className="pt-4 flex items-center gap-4">
                    <Button 
                      type="submit" 
                      disabled={submitting} 
                      className="bg-red-600 hover:bg-red-700 text-white min-w-[140px] shadow-sm"
                    >
                      {submitting ? "Submitting..." : "Submit Notice"}
                    </Button>
                    <p className="text-xs text-gray-400">By submitting, you formally request to terminate your employment.</p>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
              <CardTitle className="text-lg">Request Tracking & History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 flex justify-center text-gray-400"><Clock className="animate-spin w-6 h-6" /></div>
              ) : requests.length === 0 ? (
                <div className="p-10 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <LogOut className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-gray-900 font-medium">No resignation history</h3>
                  <p className="text-sm text-gray-500 mt-1">You have not submitted any resignation requests.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-semibold px-6 py-4">Submitted On</TableHead>
                      <TableHead className="font-semibold py-4">Requested Last Day</TableHead>
                      <TableHead className="font-semibold py-4">Reason Details</TableHead>
                      <TableHead className="font-semibold px-6 py-4 text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((req) => (
                      <TableRow key={req.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell className="px-6 py-4 text-gray-600 whitespace-nowrap">
                          {new Date(req.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="py-4 font-medium text-gray-900 whitespace-nowrap">
                          {new Date(req.requested_last_day).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="py-4">
                          <p className="text-sm text-gray-600 line-clamp-2 max-w-sm" title={req.reason_text}>
                            {req.reason_text}
                          </p>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right whitespace-nowrap">
                          {getStatusBadge(req.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
