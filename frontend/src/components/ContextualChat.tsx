"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, User, MessageCircle } from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Comment {
  id: string;
  content: string;
  authorId: number;
  author: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
  createdAt: string;
}

interface ContextualChatProps {
  entityType: string;
  entityId: string;
}

export default function ContextualChat({ entityType, entityId }: ContextualChatProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchComments();
  }, [entityType, entityId]);

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("token");
      const res = await fetch(`/api/comments/${entityType}/${entityId}`, {
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
      });
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    const optimisticComment: Comment = {
      id: `temp-${Date.now()}`,
      content: content.trim(),
      authorId: user.employee_id,
      author: {
        first_name: user.first_name,
        last_name: user.last_name,
        avatar_url: user.avatar_url,
      },
      createdAt: new Date().toISOString(),
    };

    setComments((prev) => [...prev, optimisticComment]);
    setContent("");

    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("token");
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          entityType,
          entityId,
          content: optimisticComment.content,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send comment");
      }
      
      const realComment = await res.json();
      setComments((prev) => prev.map(c => c.id === optimisticComment.id ? realComment : c));
    } catch (err) {
      console.error(err);
      setComments((prev) => prev.filter(c => c.id !== optimisticComment.id));
    }
  };

  if (loading && comments.length === 0) {
    return (
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden flex flex-col h-full min-h-[400px]">
        <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-gray-900">Discussion</h3>
        </div>
        <div className="flex-1 p-4 space-y-4">
          <Skeleton className="h-12 w-3/4 rounded-2xl ml-auto" />
          <Skeleton className="h-12 w-2/3 rounded-2xl" />
          <Skeleton className="h-12 w-1/2 rounded-2xl ml-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-0 border-gray-200 rounded-2xl overflow-hidden flex flex-col h-full transition-all focus-within:ring-2 focus-within:ring-blue-500/10">
      {/* Message History */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-white custom-thin-scrollbar"
      >
        {comments.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-60">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">No messages yet</p>
              <p className="text-[10px] text-gray-500">Ask a question or leave a note.</p>
            </div>
          </div>
        ) : (
          comments.map((comment) => {
            const isMe = user?.employee_id === comment.authorId;
            const isAdmin = comment.authorId === 1; // Assuming ID 1 is Admin/HR
            
            return (
              <div key={comment.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[90%] ${isMe ? 'ml-auto' : 'mr-auto'}`}>
                {/* Author & Badge Info */}
                {!isMe && (
                  <div className="flex items-center gap-1.5 mb-1 ml-1">
                    <span className="text-[11px] font-bold text-gray-900">{comment.author.first_name} {comment.author.last_name}</span>
                    {isAdmin && (
                      <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter border border-blue-200">
                        HR Dept
                      </span>
                    )}
                  </div>
                )}
                
                <div className="relative group">
                  {/* Bubble - Slack Style */}
                  <div className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed border ${
                    isMe 
                      ? 'bg-blue-600 text-white border-blue-700 rounded-tr-sm' 
                      : 'bg-gray-100 border-gray-200 text-gray-800 rounded-tl-sm'
                  }`}>
                    {comment.content}
                  </div>
                  
                  {/* Time Tooltip-like style */}
                  <span className={`text-[9px] text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-1/2 -translate-y-1/2 whitespace-nowrap ${isMe ? '-left-10' : '-right-10'}`}>
                    {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area - Bi-directional Reply */}
      <div className="px-4 pb-4 pt-2 bg-white">
        <form onSubmit={handleSend} className="relative flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl p-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/5 transition-all">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="Type your reply..."
            rows={1}
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-2 resize-none max-h-32 min-h-[40px] custom-thin-scrollbar outline-none"
          />
          <button
            type="submit"
            disabled={!content.trim()}
            className="w-10 h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:bg-gray-300 disabled:shadow-none shrink-0 mb-0.5"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="flex justify-between items-center px-1 mt-1.5 grayscale opacity-50">
           <p className="text-[9px] text-gray-400 font-medium font-mono uppercase tracking-widest">Two-Way Channel Active</p>
           <p className="text-[9px] text-gray-400">Shift + Enter for new line</p>
        </div>
      </div>
    </div>
  );
}
