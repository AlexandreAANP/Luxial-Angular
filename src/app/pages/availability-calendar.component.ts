import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

type CalendarDay = {
  date: Date;
  dateKey: string;
  inCurrentMonth: boolean;
  booked: boolean;
  today: boolean;
};

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseIcsDate(value: string): Date | null {
  const match = /^(\d{4})(\d{2})(\d{2})/.exec(value);
  if (!match) {
    return null;
  }
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return date.getFullYear() === Number(match[1]) &&
    date.getMonth() === Number(match[2]) - 1 &&
    date.getDate() === Number(match[3])
    ? date
    : null;
}

export function parseIcsReservations(ics: string): Set<string> {
  const lines = ics.replace(/\r\n?/g, '\n').split('\n');
  const unfolded: string[] = [];
  for (const line of lines) {
    if (/^[ \t]/.test(line) && unfolded.length) {
      unfolded[unfolded.length - 1] += line.slice(1);
    } else {
      unfolded.push(line);
    }
  }
  if (!unfolded.includes('BEGIN:VCALENDAR') || !unfolded.includes('END:VCALENDAR')) {
    throw new Error('Invalid iCalendar file.');
  }

  const bookedDates = new Set<string>();
  let event: Record<string, string> | null = null;
  for (const line of unfolded) {
    if (line === 'BEGIN:VEVENT') {
      event = {};
    } else if (line === 'END:VEVENT' && event) {
      if (event['STATUS'] !== 'CANCELLED' && event['DTSTART']) {
        const start = parseIcsDate(event['DTSTART']);
        const end = event['DTEND'] ? parseIcsDate(event['DTEND']) : null;
        if (!start || (event['DTEND'] && !end)) {
          throw new Error('Invalid reservation dates in iCalendar file.');
        }
        if (end && end < start) {
          throw new Error('Reservation end date precedes its start date.');
        }

        const cursor = new Date(start);
        while (end && cursor < end) {
          bookedDates.add(dateKey(cursor));
          cursor.setDate(cursor.getDate() + 1);
        }
        if (!end || cursor.getTime() === start.getTime()) {
          bookedDates.add(dateKey(start));
        }
      }
      event = null;
    } else if (event) {
      const separator = line.indexOf(':');
      if (separator > 0) {
        const name = line.slice(0, separator).split(';', 1)[0].toUpperCase();
        if (name === 'DTSTART' || name === 'DTEND' || name === 'STATUS') {
          event[name] = line.slice(separator + 1).trim().toUpperCase();
        }
      }
    }
  }
  return bookedDates;
}

@Component({
  selector: 'app-availability-calendar',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './availability-calendar.html',
  styleUrl: './availability-calendar.css',
})
export class AvailabilityCalendarComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly document = inject(DOCUMENT);
  private readonly today = new Date();

  private get locale(): string {
    return this.document.documentElement.lang.startsWith('en') ? 'en-GB' : 'pt-PT';
  }

  currentMonth = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
  calendarWeeks: CalendarDay[][] = [];
  bookedDates = new Set<string>();
  calendarStatus: 'loading' | 'ready' | 'error' = 'loading';

  get monthTitle(): string {
    return this.currentMonth.toLocaleDateString(this.locale, {
      month: 'long',
      year: 'numeric',
    });
  }

  get weekdays(): { compact: string; short: string; full: string }[] {
    const monday = new Date(2024, 0, 1);
    const compactNames = this.locale === 'en-GB'
      ? ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
      : ['2ª', '3ª', '4ª', '5ª', '6ª', 'Sá', 'Do'];
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return {
        compact: compactNames[index],
        short: date.toLocaleDateString(this.locale, { weekday: 'short' }),
        full: date.toLocaleDateString(this.locale, { weekday: 'long' }),
      };
    });
  }

  ngOnInit(): void {
    this.buildCalendar();
    void this.loadReservations();
  }

  previousMonth(): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() - 1,
      1,
    );
    this.buildCalendar();
  }

  nextMonth(): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + 1,
      1,
    );
    this.buildCalendar();
  }

  formatAccessibleDay(day: CalendarDay): string {
    const date = day.date.toLocaleDateString(this.locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const status = day.booked
      ? this.document.documentElement.lang.startsWith('en')
        ? 'booked'
        : 'reservado'
      : this.document.documentElement.lang.startsWith('en')
        ? 'available'
        : 'disponível';
    return `${date}, ${status}`;
  }

  private async loadReservations(): Promise<void> {
    try {
      const ics = await firstValueFrom(
        this.http.get('reservations.ics', { responseType: 'text' }),
      );
      this.bookedDates = parseIcsReservations(ics);
      this.calendarStatus = 'ready';
      this.buildCalendar();
    } catch (error) {
      console.error('Unable to load public/reservations.ics.', error);
      this.calendarStatus = 'error';
    }
  }

  private buildCalendar(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const offset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cellCount = Math.ceil((offset + daysInMonth) / 7) * 7;
    const firstCell = new Date(year, month, 1 - offset);
    const days: CalendarDay[] = Array.from({ length: cellCount }, (_, index) => {
      const date = new Date(firstCell);
      date.setDate(firstCell.getDate() + index);
      const key = dateKey(date);
      return {
        date,
        dateKey: key,
        inCurrentMonth: date.getMonth() === month,
        booked: this.bookedDates.has(key),
        today: key === dateKey(this.today),
      };
    });
    this.calendarWeeks = Array.from(
      { length: cellCount / 7 },
      (_, index) => days.slice(index * 7, index * 7 + 7),
    );
  }
}
