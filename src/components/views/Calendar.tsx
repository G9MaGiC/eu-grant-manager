import { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Download,
  X
} from 'lucide-react';
import { grants } from '@/data/mockData';
import type { ViewType } from '@/types';
import { toast } from 'sonner';

interface CalendarProps {
  onViewChange: (view: ViewType, grantId?: string) => void;
}

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'deadline' | 'meeting' | 'reminder';
  grantName?: string;
}

export function Calendar({ onViewChange }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<'month' | 'week'>('month');
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventType, setNewEventType] = useState<'deadline' | 'meeting' | 'reminder'>('meeting');

  useEffect(() => {
    gsap.fromTo('.calendar-content',
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
    );
  }, [currentDate, view]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Format date to YYYY-MM-DD in local timezone (avoids UTC conversion issues)
  const formatLocalDate = (date: Date): string => {
    return date.toLocaleDateString('en-CA'); // Returns YYYY-MM-DD format
  };

  const getGrantEvents = (date: Date) => {
    const dateStr = formatLocalDate(date);
    return grants.filter(grant => {
      if (grant.deadline === dateStr) return true;
      if (grant.timeline) {
        return grant.timeline.some(event => event.date === dateStr);
      }
      return false;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleExport = () => {
    const grantEvents: CalendarEvent[] = grants.map(g => ({
      id: `grant-${g.id}`,
      title: `${g.name} - Deadline`,
      date: g.deadline,
      type: 'deadline' as const,
      grantName: g.name
    }));
    const allEvents = [...grantEvents, ...events];
    const icsContent = generateICS(allEvents);
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grant-calendar-${new Date().toISOString().split('T')[0]}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Calendar exported successfully');
  };

  const generateICS = (events: CalendarEvent[]) => {
    const header = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//EU Grant Manager//EN\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\n';
    const footer = 'END:VCALENDAR';
    const eventBlocks = events.map(event => {
      const date = event.date.replace(/-/g, '');
      return `BEGIN:VEVENT\nDTSTART;VALUE=DATE:${date}\nDTEND;VALUE=DATE:${date}\nSUMMARY:${event.title}\nDESCRIPTION:${event.grantName || 'Calendar Event'}\nEND:VEVENT\n`;
    }).join('');
    return header + eventBlocks + footer;
  };

  const handleAddEvent = () => {
    if (newEventTitle.trim() && newEventDate) {
      const newEvent: CalendarEvent = {
        id: `e${Date.now()}`,
        title: newEventTitle,
        date: newEventDate,
        type: newEventType
      };
      setEvents([...events, newEvent]);
      setNewEventTitle('');
      setNewEventDate('');
      setShowAddEventModal(false);
      toast.success('Event added successfully');
    }
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-28" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateStr = formatLocalDate(date);
      const grantEvents = getGrantEvents(date);
      const isToday = new Date().toDateString() === date.toDateString();
      const isSelected = selectedDate?.toDateString() === date.toDateString();
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`h-28 p-2 border border-theme/50 cursor-pointer transition-colors ${
            isSelected ? 'bg-accent/10 border-accent' :
            isToday ? 'bg-accent/5 border-accent/50' :
            isWeekend ? 'bg-tertiary/30' : 'bg-tertiary/10 hover:bg-tertiary/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-sm font-medium ${
              isToday ? 'text-accent' : 
              isWeekend ? 'text-secondary/60' : 'text-primary'
            }`}>
              {day}
            </span>
            {isToday && (
              <span className="px-1.5 py-0.5 bg-accent text-white text-[10px] rounded">Today</span>
            )}
          </div>
          <div className="space-y-1">
            {grantEvents.slice(0, 2).map((grant, i) => (
              <div
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  onViewChange('grant-detail', grant.id);
                }}
                className={`px-2 py-1 rounded text-xs truncate cursor-pointer ${
                  grant.deadline === dateStr
                    ? 'bg-danger/20 text-danger hover:bg-[#EF4444]/30'
                    : 'bg-accent/20 text-accent hover:bg-accent/30'
                }`}
              >
                {grant.deadline === dateStr ? '⏰ ' : '• '}
                {grant.name}
              </div>
            ))}
            {grantEvents.length > 2 && (
              <div className="px-2 py-1 text-secondary text-xs">
                +{grantEvents.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const upcomingDeadlines = grants
    .filter(g => new Date(g.deadline) >= new Date())
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);

  return (
    <div className="p-7 calendar-content">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Calendar</h1>
          <p className="text-secondary mt-1">Track deadlines and important dates</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button 
            onClick={() => setShowAddEventModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Calendar */}
        <div className="col-span-9">
          <div className="card-dark p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-primary">
                  {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => navigateMonth('prev')}
                    className="p-2 text-secondary hover:text-primary hover:bg-tertiary rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => navigateMonth('next')}
                    className="p-2 text-secondary hover:text-primary hover:bg-tertiary rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={goToToday}
                  className="px-4 py-2 text-accent hover:bg-accent/10 rounded-lg transition-colors text-sm font-medium"
                >
                  Today
                </button>
                <div className="flex bg-tertiary rounded-lg p-1">
                  <button 
                    onClick={() => setView('month')}
                    className={`px-3 py-1.5 rounded text-sm transition-colors ${
                      view === 'month' ? 'bg-accent text-white' : 'text-secondary hover:text-primary'
                    }`}
                  >
                    Month
                  </button>
                  <button 
                    onClick={() => setView('week')}
                    className={`px-3 py-1.5 rounded text-sm transition-colors ${
                      view === 'week' ? 'bg-accent text-white' : 'text-secondary hover:text-primary'
                    }`}
                  >
                    Week
                  </button>
                </div>
              </div>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-px mb-2">
              {daysOfWeek.map((day) => (
                <div key={day} className="py-2 text-center text-secondary text-sm font-medium">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-px bg-border/30 rounded-xl overflow-hidden">
              {renderCalendarDays()}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-theme">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#EF4444]/30 rounded" />
                <span className="text-secondary text-sm">Deadline</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-accent/30 rounded" />
                <span className="text-secondary text-sm">Milestone</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#22C55E]/30 rounded" />
                <span className="text-secondary text-sm">Meeting</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-3 space-y-5">
          {/* Selected Date Events */}
          {selectedDate && (
            <div className="card-dark p-5">
              <h3 className="text-primary font-semibold mb-4">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              <div className="space-y-2">
                {getGrantEvents(selectedDate).length > 0 ? (
                  getGrantEvents(selectedDate).map((event, i) => (
                    <div 
                      key={i}
                      onClick={() => onViewChange('grant-detail', event.id)}
                      className="p-3 bg-tertiary rounded-xl hover:bg-surface-hover transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-accent" />
                        <span className="text-secondary text-xs">
                          {event.deadline === selectedDate.toISOString().split('T')[0] ? 'Deadline' : 'Milestone'}
                        </span>
                      </div>
                      <p className="text-primary text-sm font-medium">{event.name}</p>
                      <p className="text-secondary text-xs">{event.program} Program</p>
                    </div>
                  ))
                ) : (
                  <p className="text-secondary text-sm text-center py-4">No events for this date</p>
                )}
              </div>
            </div>
          )}

          {/* Upcoming Deadlines */}
          <div className="card-dark p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-primary font-semibold">Upcoming Deadlines</h3>
              <span className="px-2 py-0.5 bg-danger/15 text-danger text-xs rounded-full">
                {upcomingDeadlines.length}
              </span>
            </div>
            <div className="space-y-3">
              {upcomingDeadlines.map((grant, i) => {
                const daysLeft = Math.ceil((new Date(grant.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div 
                    key={i}
                    onClick={() => onViewChange('grant-detail', grant.id)}
                    className="flex items-center gap-3 p-3 bg-tertiary rounded-xl hover:bg-surface-hover transition-colors cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      daysLeft <= 3 ? 'bg-[#EF4444]/15' : 
                      daysLeft <= 7 ? 'bg-warning/15' : 'bg-accent/15'
                    }`}>
                      <CalendarIcon className={`w-5 h-5 ${
                        daysLeft <= 3 ? 'text-danger' : 
                        daysLeft <= 7 ? 'text-warning' : 'text-accent'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-primary text-sm font-medium truncate">{grant.name}</p>
                      <p className="text-secondary text-xs">{grant.deadline}</p>
                    </div>
                    <span className={`text-xs ${
                      daysLeft <= 3 ? 'text-danger' : 
                      daysLeft <= 7 ? 'text-warning' : 'text-secondary'
                    }`}>
                      {daysLeft}d
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card-dark p-5">
            <h3 className="text-primary font-semibold mb-4">This Month</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-secondary text-sm">Deadlines</span>
                <span className="text-primary font-medium">
                  {grants.filter(g => {
                    const d = new Date(g.deadline + 'T00:00:00'); // Parse as local time
                    return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
                  }).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary text-sm">Milestones</span>
                <span className="text-primary font-medium">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary text-sm">Meetings</span>
                <span className="text-primary font-medium">4</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-secondary border border-theme rounded-2xl p-6 w-[450px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-primary">Add Event</h2>
              <button 
                onClick={() => setShowAddEventModal(false)}
                className="text-secondary hover:text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-secondary text-sm mb-2">Event Title</label>
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="e.g., Team Meeting"
                  className="w-full bg-tertiary border border-theme rounded-xl px-4 py-3 text-primary placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <div>
                <label className="block text-secondary text-sm mb-2">Date</label>
                <input
                  type="date"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  className="w-full bg-tertiary border border-theme rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
              <div>
                <label className="block text-secondary text-sm mb-2">Type</label>
                <select
                  value={newEventType}
                  onChange={(e) => setNewEventType(e.target.value as 'deadline' | 'meeting' | 'reminder')}
                  className="w-full bg-tertiary border border-theme rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                >
                  <option value="meeting">Meeting</option>
                  <option value="deadline">Deadline</option>
                  <option value="reminder">Reminder</option>
                </select>
              </div>
              <button
                onClick={handleAddEvent}
                disabled={!newEventTitle.trim() || !newEventDate}
                className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
