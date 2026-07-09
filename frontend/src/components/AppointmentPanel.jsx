import { useEffect, useMemo, useState } from 'react';
import {
  formatSpanishDateShort,
  formatSpanishTime,
  formatTaskStatus
} from '../utils/formatters.js';
import {
  groupCalendarEventsByDate,
  normalizeDateKey
} from '../utils/calendarEvents.js';

const WEEKDAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const MONTH_LABELS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
];

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function buildMiniCalendarDays(year, monthIndex) {
  const firstDay = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const startingWeekday = (firstDay.getDay() + 6) % 7;
  const days = [];

  for (let offset = startingWeekday; offset > 0; offset -= 1) {
    const date = new Date(year, monthIndex, 1 - offset);
    days.push({
      key: formatDateKey(date),
      dayNumber: date.getDate(),
      isCurrentMonth: false
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, monthIndex, day);
    days.push({
      key: formatDateKey(date),
      dayNumber: day,
      isCurrentMonth: true
    });
  }

  while (days.length < 42) {
    const lastDay = days[days.length - 1];
    const [lastYear, lastMonth, lastDate] = lastDay.key.split('-').map(Number);
    const date = new Date(lastYear, lastMonth - 1, lastDate + 1);
    days.push({
      key: formatDateKey(date),
      dayNumber: date.getDate(),
      isCurrentMonth: false
    });
  }

  return days;
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function compareAppointmentAsc(a, b) {
  const dateDiff = String(a.dateKey || a.fecha || '').localeCompare(String(b.dateKey || b.fecha || ''));
  if (dateDiff !== 0) return dateDiff;
  return String(a.hora || '').localeCompare(String(b.hora || ''));
}

function compareAppointmentDesc(a, b) {
  return compareAppointmentAsc(b, a);
}

export default function AppointmentPanel({
  tasks = [],
  appointments,
  editingAppointment,
  form,
  onCancelEdit,
  onFormChange,
  onCreate,
  onComplete,
  onDelete,
  onEdit,
  onRecover
}) {
  const todayKey = useMemo(() => getTodayKey(), []);
  const [activeTab, setActiveTab] = useState('proximas');
  const [selectedDate, setSelectedDate] = useState('');
  const [calendarDate, setCalendarDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [isMiniCalendarOpen, setIsMiniCalendarOpen] = useState(() => window.innerWidth >= 900);

  function updateField(event) {
    onFormChange((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  useEffect(() => {
    function syncMiniCalendarState() {
      setIsMiniCalendarOpen(window.innerWidth >= 900);
    }

    syncMiniCalendarState();
    window.addEventListener('resize', syncMiniCalendarState);
    return () => window.removeEventListener('resize', syncMiniCalendarState);
  }, []);

  const eventSummaryByDay = useMemo(
    () => groupCalendarEventsByDate(tasks, appointments),
    [tasks, appointments]
  );

  const normalizedAppointments = useMemo(
    () =>
      appointments.map((appointment) => ({
        ...appointment,
        dateKey: normalizeDateKey(appointment.fecha)
      })),
    [appointments]
  );

  const groupedAppointments = useMemo(() => {
    const activeAppointments = normalizedAppointments.filter(
      (appointment) => appointment.estado !== 'completada'
    );
    const archivedAppointments = normalizedAppointments.filter(
      (appointment) => appointment.estado === 'completada'
    );
    const sortedAsc = [...activeAppointments].sort(compareAppointmentAsc);
    const sortedDesc = [...activeAppointments].sort(compareAppointmentDesc);
    const archivedDesc = [...archivedAppointments].sort((a, b) => {
      const completedAtA = a.completed_at || '';
      const completedAtB = b.completed_at || '';
      if (completedAtA && completedAtB && completedAtA !== completedAtB) {
        return completedAtB.localeCompare(completedAtA);
      }
      return compareAppointmentDesc(a, b);
    });

    return {
      proximas: sortedAsc.filter((appointment) => appointment.dateKey >= todayKey),
      hoy: sortedAsc.filter((appointment) => appointment.dateKey === todayKey),
      pasadas: sortedDesc.filter((appointment) => appointment.dateKey < todayKey),
      todas: sortedAsc,
      archivo: archivedDesc
    };
  }, [normalizedAppointments, todayKey]);

  const tabs = useMemo(
    () => [
      { id: 'proximas', label: 'Proximas', count: groupedAppointments.proximas.length },
      { id: 'hoy', label: 'Hoy', count: groupedAppointments.hoy.length },
      { id: 'pasadas', label: 'Pasadas', count: groupedAppointments.pasadas.length },
      { id: 'todas', label: 'Todas', count: groupedAppointments.todas.length },
      { id: 'archivo', label: 'Archivo', count: groupedAppointments.archivo.length }
    ],
    [groupedAppointments]
  );

  const filteredAppointments = useMemo(() => {
    const activeAppointments = groupedAppointments[activeTab] || [];
    if (!selectedDate) return activeAppointments;
    return activeAppointments.filter((appointment) => appointment.dateKey === selectedDate);
  }, [activeTab, groupedAppointments, selectedDate]);

  const emptyMessages = {
    proximas: 'No hay citas proximas.',
    hoy: 'No tienes citas para hoy.',
    pasadas: 'No hay citas pasadas.',
    todas: 'No hay citas registradas.',
    archivo: 'Aun no has completado citas.'
  };

  const calendarDays = useMemo(
    () => buildMiniCalendarDays(calendarDate.getFullYear(), calendarDate.getMonth()),
    [calendarDate]
  );

  function changeMonth(offset) {
    setCalendarDate((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  return (
    <div className="stacked-panels">
      <section className="panel">
        <header className="panel-header">
          <h2>{editingAppointment ? 'Editar cita' : 'Crear cita'}</h2>
        </header>

        <form className="compact-form" onSubmit={onCreate}>
          <input
            name="titulo"
            placeholder="Nueva cita"
            value={form.titulo}
            onChange={updateField}
            required
          />
          <textarea
            name="descripcion"
            placeholder="Descripcion"
            value={form.descripcion}
            onChange={updateField}
          />
          <div className="form-row">
            <input name="fecha" type="date" value={form.fecha} onChange={updateField} required />
            <input name="hora" type="time" value={form.hora} onChange={updateField} required />
          </div>
          <div className="appointment-form-actions">
            <button className="primary-button" type="submit">
              {editingAppointment ? 'Guardar cambios' : 'Crear cita'}
            </button>
            {editingAppointment && (
              <button className="secondary-button" onClick={onCancelEdit} type="button">
                Cancelar edicion
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="panel">
        <header className="panel-header">
          <div>
            <h2>Agenda</h2>
            <p className="muted">Gestiona citas futuras, del dia y pasadas.</p>
          </div>
          <span>{filteredAppointments.length}</span>
        </header>

        <div className="appointment-layout">
          <aside className="appointment-sidebar">
            <details
              className="appointment-mini-calendar-disclosure"
              open={isMiniCalendarOpen}
              onToggle={(event) => setIsMiniCalendarOpen(event.currentTarget.open)}
            >
              <summary className="appointment-mini-calendar-summary">
                Mini calendario
                <span>{MONTH_LABELS[calendarDate.getMonth()]}</span>
              </summary>

              <div className="appointment-mini-calendar">
                <div className="appointment-mini-calendar-header">
                  <button
                    aria-label="Mes anterior"
                    className="calendar-nav-button"
                    onClick={() => changeMonth(-1)}
                    type="button"
                  >
                    {'<'}
                  </button>
                  <strong>
                    {MONTH_LABELS[calendarDate.getMonth()]} {calendarDate.getFullYear()}
                  </strong>
                  <button
                    aria-label="Mes siguiente"
                    className="calendar-nav-button"
                    onClick={() => changeMonth(1)}
                    type="button"
                  >
                    {'>'}
                  </button>
                </div>

                <div className="appointment-mini-calendar-grid">
                  {WEEKDAY_LABELS.map((label) => (
                    <div className="appointment-mini-weekday" key={label}>
                      {label}
                    </div>
                  ))}

                  {calendarDays.map((day) => {
                    const summary = eventSummaryByDay[day.key] || null;
                    const taskCount = summary?.taskCount || 0;
                    const appointmentCount = summary?.appointmentCount || 0;
                    const count = taskCount + appointmentCount;
                    const isToday = day.key === todayKey;
                    const isSelected = day.key === selectedDate;

                    return (
                      <button
                        className={[
                          'appointment-mini-day',
                          day.isCurrentMonth ? 'is-current-month' : 'is-outside-month',
                          isToday ? 'is-today' : '',
                          isSelected ? 'is-selected' : '',
                          count ? 'has-appointments' : ''
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        key={day.key}
                        onClick={() => setSelectedDate(day.key)}
                        type="button"
                      >
                        <span>{day.dayNumber}</span>
                        {count > 0 && (
                          <div className="calendar-dot-row" aria-hidden="true">
                            {taskCount > 0 && <span className="calendar-dot is-task" />}
                            {appointmentCount > 0 && <span className="calendar-dot is-appointment" />}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {selectedDate && (
                  <button
                    className="link-button appointment-clear-filter"
                    onClick={() => setSelectedDate('')}
                    type="button"
                  >
                    Limpiar seleccion
                  </button>
                )}
              </div>
            </details>
          </aside>

          <div className="appointment-agenda">
            <div className="task-tabs" role="tablist" aria-label="Vistas de agenda">
              {tabs.map((tab) => (
                <button
                  className={activeTab === tab.id ? 'is-active' : ''}
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  role="tab"
                  type="button"
                >
                  {tab.label}
                  <small>{tab.count}</small>
                </button>
              ))}
            </div>

            {selectedDate && (
              <div className="appointment-filter-state">
                <span>Filtrando por {selectedDate}</span>
                <button type="button" onClick={() => setSelectedDate('')}>
                  Quitar filtro
                </button>
              </div>
            )}

            <div className="item-list compact">
              {filteredAppointments.length === 0 && (
                <p className="muted appointment-empty-state">{emptyMessages[activeTab]}</p>
              )}
              {filteredAppointments.map((appointment) => (
                <article
                  className={`item appointment-item ${appointment.estado === 'completada' ? 'is-archived' : ''}`}
                  key={appointment.id}
                >
                  <div>
                    <div className="appointment-title-row">
                      <h3>{appointment.titulo}</h3>
                      <small className="appointment-time-badge">
                        {formatSpanishTime(appointment.hora)}
                      </small>
                    </div>
                    {appointment.descripcion && <p>{appointment.descripcion}</p>}
                    <div className="task-meta-row">
                      <small className="appointment-date-badge">
                        {formatSpanishDateShort(appointment.fecha)}
                      </small>
                      <small className="appointment-time-text">
                        {formatSpanishTime(appointment.hora)}
                      </small>
                      <small className="appointment-status-badge">
                        {formatTaskStatus(appointment.estado)}
                      </small>
                      {appointment.completed_at && (
                        <small className="appointment-completed-badge">
                          Completada
                        </small>
                      )}
                    </div>
                  </div>
                  <div className="item-actions">
                    {appointment.estado !== 'completada' ? (
                      <>
                        <button type="button" onClick={() => onEdit(appointment)}>
                          Editar
                        </button>
                        <button type="button" onClick={() => onComplete(appointment)}>
                          Completar
                        </button>
                      </>
                    ) : (
                      <button type="button" onClick={() => onRecover(appointment)}>
                        Recuperar
                      </button>
                    )}
                    <button type="button" onClick={() => onDelete(appointment.id)}>
                      Eliminar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
