"use client";

import React, { useEffect, useState, useMemo } from "react";
import { 
  Megaphone, 
  Search, 
  Filter, 
  Inbox, 
  RefreshCw,
  LayoutGrid,
  List
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import AnnouncementCard from "@/components/AnnouncementCard";
import { useAuth } from "@/src/hooks/useAuth";

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: string;
  target_audience: string;
  priority: string;
  status: string;
  created_at: string;
}

export default function CompanyNewsPage() {
  const { user, loading: authLoading } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAnnouncements = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    
    setError(null);
    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("token");
      const res = await fetch("/api/announcements/feed", {
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        credentials: "include"
      });

      if (!res.ok) {
        throw new Error("Failed to fetch announcements");
      }

      const data = await res.json();
      setAnnouncements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchAnnouncements();
    }
  }, [user, authLoading]);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter(ann => {
      const matchesSearch = ann.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ann.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || ann.type.toLowerCase() === categoryFilter.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [announcements, searchQuery, categoryFilter]);

  if (authLoading || (loading && !isRefreshing && announcements.length === 0)) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-10 w-64 bg-gray-200" />
            <Skeleton className="h-4 w-96 bg-gray-200" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-11 flex-1 bg-gray-200 rounded-xl" />
            <Skeleton className="h-11 w-40 bg-gray-200 rounded-xl" />
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-48 w-full bg-gray-200 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
                <Megaphone className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 font-inter">
                Company News & Announcements
              </h1>
            </div>
            <p className="text-gray-500 font-medium text-lg ml-1">
              Stay updated with the latest policies, events, and company-wide updates.
            </p>
          </div>
          
          <button 
            onClick={() => fetchAnnouncements(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Feed
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 sticky top-4 z-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search announcements..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 rounded-xl border-gray-100 bg-gray-50/50 hover:bg-gray-50 focus:bg-white transition-all"
            />
          </div>
          
          <div className="w-full md:w-48">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-12 rounded-xl border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <SelectValue placeholder="All Categories" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-100">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="policy">Policy</SelectItem>
                <SelectItem value="event">Events</SelectItem>
                <SelectItem value="alert">Alerts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-6">
          {error && (
            <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-red-700 flex flex-col items-center justify-center text-center space-y-2">
              <h3 className="font-bold">Unable to load feed</h3>
              <p className="text-sm opacity-90">{error}</p>
              <button onClick={() => fetchAnnouncements()} className="text-sm font-bold underline mt-2 hover:no-underline">Try again</button>
            </div>
          )}

          {!loading && filteredAnnouncements.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-white border border-dashed border-gray-200 rounded-3xl">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                <Inbox className="w-10 h-10 text-gray-300" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-gray-900">
                  {searchQuery || categoryFilter !== 'all' ? "No matching announcements" : "No new announcements"}
                </h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  {searchQuery || categoryFilter !== 'all' 
                    ? "Try adjusting your filters or search term to find what you're looking for." 
                    : "You're all caught up! When new announcements are posted, they'll appear here."}
                </p>
              </div>
              {(searchQuery || categoryFilter !== 'all') && (
                <button 
                  onClick={() => { setSearchQuery(""); setCategoryFilter("all"); }}
                  className="text-blue-600 font-bold text-sm hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 animate-in fade-in duration-500">
              {filteredAnnouncements.map((ann) => (
                <AnnouncementCard key={ann.id} announcement={ann} />
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        {!loading && filteredAnnouncements.length > 0 && (
          <div className="pt-8 text-center text-sm text-gray-400 font-medium">
            Showing {filteredAnnouncements.length} announcement{filteredAnnouncements.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}
