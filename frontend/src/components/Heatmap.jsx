import { useMemo } from 'react';
import { format, subDays, eachDayOfInterval, startOfWeek, getDay } from 'date-fns';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getColor = (count, max) => {
  if (!count || count === 0) return 'rgba(255,255,255,0.04)';
  const intensity = Math.min(count / Math.max(max, 1), 1);
  if (intensity < 0.25) return 'rgba(124,58,237,0.3)';
  if (intensity < 0.5) return 'rgba(124,58,237,0.5)';
  if (intensity < 0.75) return 'rgba(124,58,237,0.7)';
  return 'rgba(168,85,247,0.95)';
};

export default function Heatmap({ data = {}, blurred = false }) {
  const today = new Date();
  const startDate = subDays(today, 364);

  const days = useMemo(() => {
    return eachDayOfInterval({ start: startDate, end: today });
  }, []);

  const maxCount = useMemo(() => {
    return Math.max(1, ...Object.values(data).map((d) => d?.count || d || 0));
  }, [data]);

  // Group into weeks (columns)
  const weeks = useMemo(() => {
    const w = [];
    let week = [];

    // Pad start with empty slots for day-of-week alignment
    const firstDayOfWeek = getDay(days[0]);
    for (let i = 0; i < firstDayOfWeek; i++) {
      week.push(null);
    }

    days.forEach((day) => {
      if (week.length === 7) {
        w.push(week);
        week = [];
      }
      week.push(day);
    });

    if (week.length > 0) {
      while (week.length < 7) week.push(null);
      w.push(week);
    }

    return w;
  }, [days]);

  // Month labels (position by week index)
  const monthLabels = useMemo(() => {
    const labels = [];
    let lastMonth = -1;
    weeks.forEach((week, wi) => {
      const firstReal = week.find((d) => d !== null);
      if (!firstReal) return;
      const month = firstReal.getMonth();
      if (month !== lastMonth) {
        labels.push({ index: wi, label: MONTHS[month] });
        lastMonth = month;
      }
    });
    return labels;
  }, [weeks]);

  const cellSize = 13;
  const gap = 3;

  // Generate dummy data for blurred preview
  const displayData = blurred
    ? Object.fromEntries(
        days.filter(() => Math.random() > 0.6).map((d) => [
          format(d, 'yyyy-MM-dd'),
          { count: Math.floor(Math.random() * 5) + 1 },
        ])
      )
    : data;

  return (
    <div>
      {/* Day labels */}
      <div style={{ display: 'flex', gap: 0 }}>
        <div style={{ width: 28 }} /> {/* spacer for day labels */}
        <div style={{ position: 'relative', width: weeks.length * (cellSize + gap) }}>
          {monthLabels.map(({ index, label }) => (
            <span
              key={index}
              style={{
                position: 'absolute',
                left: index * (cellSize + gap),
                fontSize: 10,
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
                top: 0,
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 0, marginTop: 20 }}>
        {/* Day of week labels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: gap, marginRight: 4, paddingTop: 0 }}>
          {DAYS.map((day, i) => (
            <div
              key={day}
              style={{
                height: cellSize,
                fontSize: 9,
                color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center',
                width: 24,
                visibility: i % 2 === 0 ? 'visible' : 'hidden',
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: 'flex', gap: gap, overflowX: 'auto' }}>
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap }}>
              {week.map((day, di) => {
                if (!day) return (
                  <div key={di} style={{ width: cellSize, height: cellSize }} />
                );
                const dateStr = format(day, 'yyyy-MM-dd');
                const dayData = displayData[dateStr];
                const count = dayData?.count || dayData || 0;
                const color = getColor(count, maxCount);
                const isToday = dateStr === format(today, 'yyyy-MM-dd');

                return (
                  <div
                    key={di}
                    title={`${format(day, 'MMM d, yyyy')}: ${count} completion${count !== 1 ? 's' : ''}`}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      borderRadius: 3,
                      background: color,
                      border: isToday ? '1px solid var(--purple-light)' : '1px solid transparent',
                      cursor: 'pointer',
                      transition: 'var(--transition)',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.outline = '1px solid rgba(168,85,247,0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.outline = 'none';
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        marginTop: 12, justifyContent: 'flex-end',
      }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Less</span>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              width: 13, height: 13, borderRadius: 3,
              background: getColor(i, 4),
            }}
          />
        ))}
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>More</span>
      </div>
    </div>
  );
}
