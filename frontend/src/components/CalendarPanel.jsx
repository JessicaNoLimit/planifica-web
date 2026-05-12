import MonthlyCalendar from './MonthlyCalendar.jsx';

export default function CalendarPanel({ tasks, appointments }) {
  return <MonthlyCalendar appointments={appointments} tasks={tasks} />;
}
