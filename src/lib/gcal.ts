import { GoogleCalendarEvent, TaskItem } from '../types';

/**
 * Fetch events from the primary Google Calendar.
 */
export async function fetchGoogleCalendarEvents(accessToken: string): Promise<GoogleCalendarEvent[]> {
  const now = new Date();
  const pastMonth = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString();
  const futureMonth = new Date(now.getFullYear(), now.getMonth() + 6, 1).toISOString();

  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(pastMonth)}&timeMax=${encodeURIComponent(futureMonth)}&singleEvents=true&orderBy=startTime&maxResults=50`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Google Calendar API error (${response.status})`);
  }

  const data = await response.json();
  return data.items || [];
}

/**
 * Sync Google Calendar events into local tasks array without duplicating
 */
export function convertGCalEventsToTasks(events: GoogleCalendarEvent[], existingTasks: TaskItem[]): TaskItem[] {
  const existingGCalIds = new Set(
    existingTasks
      .filter((t) => t.gcalEventId)
      .map((t) => t.gcalEventId)
  );

  const newTasks: TaskItem[] = [];

  for (const ev of events) {
    if (!ev.summary) continue;
    if (existingGCalIds.has(ev.id)) continue;

    const startDateStr = ev.start?.dateTime || ev.start?.date || '';
    if (!startDateStr) continue;

    const dateObj = new Date(startDateStr);
    const deadlineFormatted = dateObj.toISOString().split('T')[0];
    const timeFormatted = ev.start?.dateTime 
      ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      : '09:00';

    newTasks.push({
      id: `gcal-${ev.id}`,
      gcalEventId: ev.id,
      title: `[GCal] ${ev.summary}`,
      deadline: deadlineFormatted,
      time: timeFormatted,
      type: 'Jadwal GCal',
      progress: 'Belum Dikerjakan',
      eisenhower: 'Schedule',
      notes: ev.description || `Jadwal tersinkron dari Google Calendar (${ev.htmlLink || 'Primary Calendar'})`,
      syncedToGCal: true,
      pomodoroSessionsCompleted: 0,
      createdAt: new Date().toISOString(),
    });
  }

  return [...existingTasks, ...newTasks];
}

/**
 * Push a new task to Google Calendar
 */
export async function pushTaskToGoogleCalendar(accessToken: string, task: TaskItem): Promise<string> {
  const deadlineDate = task.deadline || new Date().toISOString().split('T')[0];
  const timeStr = task.time || '09:00';

  const startDateTime = new Date(`${deadlineDate}T${timeStr}:00`);
  const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hour duration default

  const body = {
    summary: task.title,
    description: `Target Aplikasi Task System\nTipe: ${task.type}\nKuadran Eisenhower: ${task.eisenhower}\nProgress: ${task.progress}\nCatatan: ${task.notes || '-'}`,
    start: {
      dateTime: startDateTime.toISOString(),
    },
    end: {
      dateTime: endDateTime.toISOString(),
    },
  };

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gagal mengirim ke Google Calendar (${response.status})`);
  }

  const createdEvent = await response.json();
  return createdEvent.id;
}
