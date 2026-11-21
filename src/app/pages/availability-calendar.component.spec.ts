import { parseIcsReservations } from './availability-calendar.component';

describe('parseIcsReservations', () => {
  it('marks reservation dates inclusive of arrival and exclusive of departure', () => {
    const calendar = [
      'BEGIN:VCALENDAR',
      'BEGIN:VEVENT',
      'DTSTART;VALUE=DATE:20261122',
      'DTEND;VALUE=DATE:20261125',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    expect(parseIcsReservations(calendar)).toEqual(
      new Set(['2026-11-22', '2026-11-23', '2026-11-24']),
    );
  });

  it('ignores cancelled events and rejects malformed calendars', () => {
    const calendar = [
      'BEGIN:VCALENDAR',
      'BEGIN:VEVENT',
      'STATUS:CANCELLED',
      'DTSTART;VALUE=DATE:20261122',
      'DTEND;VALUE=DATE:20261125',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n');

    expect(parseIcsReservations(calendar).size).toBe(0);
    expect(() => parseIcsReservations('not an iCalendar file')).toThrow(
      'Invalid iCalendar file.',
    );
  });
});
