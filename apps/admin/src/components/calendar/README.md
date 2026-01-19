# Weekly Calendar Implementation Documentation

## 📋 Overview

A production-ready weekly calendar component for clinic appointment management systems. Designed for receptionists and administrators who need to manage 20+ appointments per day efficiently.

## 🏗️ Architecture

```
apps/admin/src/
├── components/
│   └── calendar/
│       ├── index.ts                    # Module exports
│       ├── WeeklyCalendar.tsx          # Main calendar component
│       └── AppointmentDetailModal.tsx  # Detail/edit modal
└── app/dashboard/appointments/
    └── page.tsx                        # Integrated appointments page
```

## 🎯 Design Decisions

### Why Custom Implementation vs Library?

| Aspect | Custom (Chosen) | FullCalendar | React Big Calendar |
|--------|-----------------|--------------|-------------------|
| Bundle Size | ~15KB | ~150KB | ~80KB |
| Customization | Full control | Limited themes | CSS override |
| Overlap handling | Custom algorithm | Good | Basic |
| Tailwind integration | Native | Needs wrapper | Needs wrapper |
| Mongolian locale | Built-in | Needs config | Needs config |

**Decision**: Custom implementation for:
- Smaller bundle size
- Full Tailwind CSS integration
- Complete control over overlap rendering
- Built-in localization
- Hospital-specific optimizations

## 📦 Components

### 1. WeeklyCalendar

Main calendar component with time-based vertical layout.

```tsx
import { WeeklyCalendar } from '@/components/calendar';

<WeeklyCalendar
  appointments={appointments}
  onAppointmentClick={(apt) => setSelected(apt)}
  onStatusChange={(id, status) => updateStatus(id, status)}
  startHour={8}          // Grid starts at 08:00
  endHour={20}           // Grid ends at 20:00
  slotDuration={30}      // 30-minute slots
  loading={isLoading}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `appointments` | `AppointmentWithDetails[]` | required | Array of appointments |
| `onAppointmentClick` | `(apt) => void` | - | Click handler |
| `onStatusChange` | `(id, status) => void` | - | Status update handler |
| `startHour` | `number` | 8 | First hour displayed |
| `endHour` | `number` | 20 | Last hour displayed |
| `slotDuration` | `number` | 30 | Minutes per visual slot |
| `loading` | `boolean` | false | Show loading state |

### 2. AppointmentDetailModal

Modal for viewing and editing appointment details.

```tsx
import { AppointmentDetailModal } from '@/components/calendar';

<AppointmentDetailModal
  appointment={selectedAppointment}
  onClose={() => setSelected(null)}
  onStatusChange={(id, status) => updateStatus(id, status)}
/>
```

## 🔧 Overlap Algorithm

The calendar uses an **interval scheduling algorithm** to handle overlapping appointments:

```
Time     | Without Overlap Handling | With Overlap Handling
---------|-------------------------|----------------------
09:00    | █████████████████████   | ████████ ████████
09:30    | ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   | ████████ ▓▓▓▓▓▓▓▓
10:00    | (hidden/overflow)       | ████████
```

### Algorithm Steps:

1. **Sort by start time**, longer appointments first for ties
2. **Find overlapping groups** using sweep-line technique
3. **Assign columns** within each overlap group
4. **Calculate width** = `100% / totalColumns`
5. **Position horizontally** = `column * width`

## 🎨 Styling Guide

### Status Colors (Tailwind)

```tsx
const STATUS_COLORS = {
  PENDING: {
    bg: 'bg-amber-50',
    border: 'border-l-amber-400',
    text: 'text-amber-900',
  },
  CONFIRMED: {
    bg: 'bg-emerald-50',
    border: 'border-l-emerald-400',
    text: 'text-emerald-900',
  },
  CANCELLED: {
    bg: 'bg-red-50',
    border: 'border-l-red-400',
    text: 'text-red-900',
  },
  COMPLETED: {
    bg: 'bg-slate-100',
    border: 'border-l-slate-400',
    text: 'text-slate-700',
  },
};
```

### Customizing Time Grid

Adjust `pixelsPerMinute` for denser/sparser grids:

```tsx
// Default: 60px per hour
const pixelsPerMinute = 60 / slotDuration; // 2px per minute for 30min slots

// Denser grid: 120px per hour
const pixelsPerMinute = 120 / slotDuration; // 4px per minute
```

## 📱 Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| Desktop (≥1024px) | Full 7-day view with all details |
| Tablet (768-1023px) | 7-day view, condensed appointment blocks |
| Mobile (<768px) | Horizontal scroll, single-day focus recommended |

## ⚡ Performance Optimizations

1. **Memoization**: `useMemo` for positioned appointments calculation
2. **Callback stability**: `useCallback` for event handlers
3. **Virtualization ready**: Structure supports windowing if needed
4. **Minimal re-renders**: Isolated state per component

## 🔗 Data Format

### Expected Appointment Format

```typescript
interface AppointmentWithDetails {
  id: string;
  date: string;        // "2026-01-20" ISO date
  time: string;        // "10:00" HH:mm format
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes: string | null;
  patient: {
    id: string;
    name: string;
    phone: string;
  };
  doctor: {
    id: string;
    name: string;
    specialization: string;
  };
}
```

## 🏥 UX Considerations for Clinics

### 1. Information Hierarchy
- **Primary**: Time + Patient Name (always visible)
- **Secondary**: Doctor name (visible if space allows)
- **Tertiary**: Status badge (color-coded)

### 2. Quick Actions
- Click anywhere on appointment → Open detail modal
- Status buttons in modal → One-click status change
- Phone link → Direct call capability

### 3. Visual Indicators
- **Current time line**: Red line shows current moment
- **Today highlight**: Blue background on current day
- **Appointment count**: Badge showing daily total

### 4. Navigation
- Arrow buttons for week navigation
- "Today" button for quick return
- Doctor/status filters persist across navigation

## 🧪 Testing Scenarios

1. **Basic rendering**: 0 appointments, 1 appointment, many appointments
2. **Overlap handling**: 2, 3, 5+ simultaneous appointments
3. **Edge cases**: Appointments at day boundaries, midnight
4. **Status changes**: All 4 status transitions
5. **Navigation**: Week forward/backward, today button
6. **Filters**: Doctor filter, status filter, combined

## 🚀 Future Enhancements

- [ ] Drag-and-drop rescheduling
- [ ] Create appointment by clicking empty slot
- [ ] Multi-doctor column view
- [ ] Print/export view
- [ ] Keyboard navigation (a11y)
- [ ] Touch gestures for mobile

## 📊 Data Flow

```
┌─────────────────┐
│  API: /appointments/range  │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  appointments   │ (state in page.tsx)
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ WeeklyCalendar  │
│ ┌─────────────┐ │
│ │ appointmentsByDate (useMemo) │
│ └──────┬──────┘ │
│        ▼        │
│ ┌─────────────┐ │
│ │ DayColumn   │ × 7
│ │ ┌─────────┐ │ │
│ │ │positioned│ │ │ (overlap calculated)
│ │ └────┬────┘ │ │
│ │      ▼      │ │
│ │ AppointmentBlock │
│ └─────────────┘ │
└─────────────────┘
```

## 🔍 Debugging Tips

1. Check `appointmentsByDate` map in React DevTools
2. Verify date format consistency (ISO vs local)
3. Inspect `positioned` array for overlap calculation
4. Check CSS `z-index` for overlapping issues
