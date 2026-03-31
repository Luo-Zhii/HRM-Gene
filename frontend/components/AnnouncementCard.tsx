import React from 'react';
import { Calendar, Users, Info, Bell, AlertTriangle } from 'lucide-react';

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

interface AnnouncementCardProps {
  announcement: Announcement;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ announcement }) => {
  const getTypeStyles = (type: string) => {
    switch (type.toLowerCase()) {
      case 'policy':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'event':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'alert':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'policy':
        return <Info className="w-3 h-3" />;
      case 'event':
        return <Calendar className="w-3 h-3" />;
      case 'alert':
        return <AlertTriangle className="w-3 h-3" />;
      default:
        return <Bell className="w-3 h-3" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTargetLabel = (target: string) => {
    if (target === 'all') return 'All Employees';
    if (target.startsWith('dept_')) {
      // In a real app, we'd probably map the ID to a name, 
      // but for now we'll show the raw context or a generic label.
      return 'Specific Department';
    }
    return target;
  };

  return (
    <div className="group bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex flex-col space-y-4">
        {/* Top Row: Badge and Date */}
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold uppercase tracking-wider ${getTypeStyles(announcement.type)}`}>
            {getTypeIcon(announcement.type)}
            {announcement.type}
          </span>
          <span className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-gray-400" />
            {formatDate(announcement.created_at)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
          {announcement.title}
        </h3>

        {/* Content */}
        <div className="text-gray-600 leading-relaxed whitespace-pre-wrap text-[15px]">
          {announcement.content}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
            <Users className="w-3.5 h-3.5" />
            <span>Target: {getTargetLabel(announcement.target_audience)}</span>
          </div>
          
          {announcement.priority === 'High' && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              Urgent Attention
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementCard;
