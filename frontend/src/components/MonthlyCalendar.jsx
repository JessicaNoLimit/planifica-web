import { useEffect, useMemo, useState } from 'react';

const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
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

function parseDateParts(value) {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return { year, monthIndex: month - 1, day };
}

function toDateKey(year, monthIndex, day) {
  const month = `${monthIndex + 1}`.padStart(2, '0');
  const paddedDay = `${day}`.padStart(2, '0');
  return `${year}-${month}-${paddedDay}`;
}

function isSameMonth(year, monthIndex, date) {
  return date.year === year && date.monthIndex === monthIndex;
}

function addDays(date, amount) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

function startOfWeek(date) {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const weekday = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - weekday);
  return result;
}

function formatShortDate(date) {
  return `${date.getDate()} ${MONTH_LABELS[date.getMonth()].slice(0, 3)}`;
}

function formatLongDate(dateKey) {
  const parts = parseDateParts(dateKey);
  if (!parts) return dateKey;
  return `${parts.day} de ${MONTH_LABELS[parts.monthIndex]} de ${parts.year}`;
}

function buildCalendarDays(year, monthIndex) {
  const firstDay = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const startingWeekday = (firstDay.getDay() + 6) % 7;
  const days = [];

  for (let offset = startingWeekday; offset > 0; offset -= 1) {
    const date = new Date(year, monthIndex, 1 - offset);
    days.push({
      key: toDateKey(date.getFullYear(), date.getMonth(), date.getDate()),
      dayNumber: date.getDate(),
      year: date.getFullYear(),
      monthIndex: date.getMonth()
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push({
      key: toDateKey(year, monthIndex, day),
      dayNumber: day,
      year,
      monthIndex
    });
  }

  while (days.length < 42) {
    const lastDay = days[days.length - 1];
    const date = new Date(lastDay.year, lastDay.monthIndex, lastDay.dayNumber + 1);
    days.push({
      key: toDateKey(date.getFullYear(), date.getMonth(), date.getDate()),
      dayNumber: date.getDate(),
      year: date.getFullYear(),
      monthIndex: date.getMonth()
    });
  }

  return days;
}

function buildWeekDays(referenceDate) {
  const firstDay = startOfWeek(referenceDate);
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(firstDay, index);
    return {
      key: toDateKey(date.getFullYear(), date.getMonth(), date.getDate()),
      dayNumber: date.getDate(),
      year: date.getFullYear(),
      monthIndex: date.getMonth()
    };
  });
}

function normalizeEvents(tasks, appointments) {
  const taskEvents = tasks
    .filter((task) => task.fecha)
    .map((task) => ({
      id: `task-${task.id}`,
      dateKey: task.fecha,
      type: 'task',
      title: task.titulo,
      meta: 'Tarea',
      priority: task.prioridad,
      status: task.estado,
      description: task.descripcion,
      isFavorite: Boolean(task.is_favorite),
      completedAt: task.completed_at,
      sortKey: `1-${task.titulo.toLowerCase()}`
    }));

  const appointmentEvents = appointments
    .filter((appointment) => appointment.fecha && appointment.estado !== 'completada')
    .map((appointment) => ({
      id: `appointment-${appointment.id}`,
      dateKey: appointment.fecha,
      type: 'appointment',
      title: appointment.titulo,
      meta: appointment.hora ? `${appointment.hora}` : 'Cita',
      time: appointment.hora,
      description: appointment.descripcion,
      status: appointment.estado,
      completedAt: appointment.completed_at,
      sortKey: `0-${appointment.hora || '99:99'}-${appointment.titulo.toLowerCase()}`
    }));

  return [...appointmentEvents, ...taskEvents].sort((a, b) => a.sortKey.localeCompare(b.sortKey));
}

export default function MonthlyCalendar({ tasks, appointments, compact = false }) {
  const today = new Date();
  const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [viewMode, setViewMode] = useState('month');
  const [selectedDateKey, setSelectedDateKey] = useState(todayKey);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedCalendarItem, setSelectedCalendarItem] = useState(null);

  const allEvents = useMemo(() => normalizeEvents(tasks, appointments), [tasks, appointments]);
  const eventsByDate = useMemo(
    () =>
      allEvents.reduce((acc, event) => {
        acc[event.dateKey] = acc[event.dateKey] || [];
        acc[event.dateKey].push(event);
        return acc;
      }, {}),
    [allEvents]
  );

  const year = viewDate.getFullYear();
  const monthIndex = viewDate.getMonth();
  const monthDays = useMemo(() => buildCalendarDays(year, monthIndex), [year, monthIndex]);
  const weekDays = useMemo(() => buildWeekDays(viewDate), [viewDate]);
  const isWeekView = !compact && viewMode === 'week';
  const days = isWeekView ? weekDays : monthDays;

  const monthEventsCount = useMemo(
    () =>
      allEvents.filter((event) => {
        const date = parseDateParts(event.dateKey);
        return date && isSameMonth(year, monthIndex, date);
      }).length,
    [allEvents, monthIndex, year]
  );

  const weekEventsCount = useMemo(
    () => weekDays.reduce((count, day) => count + (eventsByDate[day.key]?.length || 0), 0),
    [eventsByDate, weekDays]
  );

  const firstWeekDay = weekDays[0];
  const lastWeekDay = weekDays[6];
  const monthLabel = `${MONTH_LABELS[monthIndex]} ${year}`;
  const weekLabel = `${formatShortDate(
    new Date(firstWeekDay.year, firstWeekDay.monthIndex, firstWeekDay.dayNumber)
  )} - ${formatShortDate(new Date(lastWeekDay.year, lastWeekDay.monthIndex, lastWeekDay.dayNumber))}`;

  const selectedDateEvents = compact ? [] : eventsByDate[selectedDateKey] || [];
  const selectedTaskEvents = selectedDateEvents.filter((event) => event.type === 'task');
  const selectedAppointmentEvents = selectedDateEvents.filter((event) => event.type === 'appointment');

  function changePeriod(offset) {
    setViewDate((current) =>
      isWeekView
        ? addDays(current, offset * 7)
        : new Date(current.getFullYear(), current.getMonth() + offset, 1)
    );
  }

  function handleWeekViewChange() {
    setViewMode((current) => {
      if (current !== 'week') {
        setViewDate(new Date());
      }
      return 'week';
    });
  }

  useEffect(() => {
    if (compact) return;
    const visibleDateKeys = days.map((day) => day.key);
    if (visibleDateKeys.includes(selectedDateKey)) return;
    setSelectedDateKey(visibleDateKeys.includes(todayKey) ? todayKey : visibleDateKeys[0]);
  }, [compact, days, selectedDateKey, todayKey]);

  useEffect(() => {
    if (!isDetailOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        if (selectedCalendarItem) {
          setSelectedCalendarItem(null);
          return;
        }
        setIsDetailOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDetailOpen, selectedCalendarItem]);

  function handleDateSelect(dateKey) {
    setSelectedDateKey(dateKey);
    setSelectedCalendarItem(null);
    setIsDetailOpen(true);
  }

  function closeDayDetail() {
    setSelectedCalendarItem(null);
    setIsDetailOpen(false);
  }

  function openCalendarItemDetail(event) {
    setSelectedCalendarItem(event);
  }

  return (
    <section className={`panel calendar-panel ${compact ? 'calendar-panel-compact' : ''}`}>
      <header className="panel-header calendar-panel-header">
        <div>
          <h2>{compact ? 'Mini calendario' : 'Calendario'}</h2>
          {!compact && (
            <p className="muted">
              Tareas y citas distribuidas por {isWeekView ? 'semana' : 'mes'}.
            </p>
          )}
        </div>

        <div className="calendar-toolbar">
          {!compact && (
            <div className="calendar-view-toggle" role="tablist" aria-label="Cambiar vista de calendario">
              <button
                aria-selected={viewMode === 'month'}
                className={viewMode === 'month' ? 'is-active' : ''}
                onClick={() => setViewMode('month')}
                role="tab"
                type="button"
              >
                Mes
              </button>
              <button
                aria-selected={viewMode === 'week'}
                className={viewMode === 'week' ? 'is-active' : ''}
                onClick={handleWeekViewChange}
                role="tab"
                type="button"
              >
                Semana
              </button>
            </div>
          )}

          <div className="calendar-nav">
            <button
              aria-label={isWeekView ? 'Semana anterior' : 'Periodo anterior'}
              className="calendar-nav-button"
              onClick={() => changePeriod(-1)}
              type="button"
            >
              {'<'}
            </button>
            <strong className="calendar-month-label">{isWeekView ? weekLabel : monthLabel}</strong>
            <button
              aria-label={isWeekView ? 'Semana siguiente' : 'Periodo siguiente'}
              className="calendar-nav-button"
              onClick={() => changePeriod(1)}
              type="button"
            >
              {'>'}
            </button>
          </div>
        </div>
      </header>

      {!compact && (
        <div className="calendar-summary-row">
          <span>
            {isWeekView ? weekEventsCount : monthEventsCount} eventos en{' '}
            {isWeekView ? 'esta semana' : 'este mes'}
          </span>
          <div className="calendar-legend" aria-label="Leyenda del calendario">
            <span className="calendar-legend-item">
              <i className="calendar-legend-swatch is-task" aria-hidden="true" />
              Tarea
            </span>
            <span className="calendar-legend-item">
              <i className="calendar-legend-swatch is-appointment" aria-hidden="true" />
              Cita
            </span>
          </div>
        </div>
      )}

      <div className={`calendar-grid ${compact ? 'is-compact' : ''} ${isWeekView ? 'is-week' : ''}`}>
        {WEEKDAY_LABELS.map((label) => (
          <div className="calendar-weekday" key={label}>
            {label}
          </div>
        ))}

        {days.map((day) => {
          const dateKey = day.key;
          const events = eventsByDate[dateKey] || [];
          const isCurrentMonth = isWeekView || compact ? true : day.monthIndex === monthIndex;
          const isToday = dateKey === todayKey;
          const isSelected = !compact && dateKey === selectedDateKey;
          const visibleEvents = compact ? [] : events.slice(0, isWeekView ? 4 : 2);

          return (
            <article
              className={[
                'calendar-cell',
                isCurrentMonth ? 'is-current-month' : 'is-outside-month',
                isToday ? 'is-today' : '',
                isSelected ? 'is-selected' : '',
                events.length ? 'has-events' : ''
              ]
                .filter(Boolean)
                .join(' ')}
              key={dateKey}
              onClick={compact ? undefined : () => handleDateSelect(dateKey)}
            >
              <div className="calendar-cell-head">
                <span className="calendar-day-number">{day.dayNumber}</span>
                {compact && events.length > 0 && <span className="calendar-day-count">{events.length}</span>}
              </div>

              {compact ? (
                <div className="calendar-dot-row" aria-hidden="true">
                  {events.slice(0, 3).map((event) => (
                    <span className={`calendar-dot is-${event.type}`} key={event.id} />
                  ))}
                </div>
              ) : (
                <div className="calendar-events">
                  {visibleEvents.map((event) => (
                    <div className={`calendar-event is-${event.type}`} key={event.id}>
                      <span className="calendar-event-meta">{event.meta}</span>
                      <span className="calendar-event-title">{event.title}</span>
                    </div>
                  ))}
                  {events.length > visibleEvents.length && (
                    <small className="calendar-more">+{events.length - visibleEvents.length} mas</small>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>

      {!compact && isDetailOpen && (
        <div className="calendar-modal-overlay" onClick={closeDayDetail} role="presentation">
          <section
            aria-modal="true"
            className="calendar-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <header className="calendar-modal-header">
              <div>
                <h3>Detalle del dia</h3>
                <p className="muted">{formatLongDate(selectedDateKey)}</p>
              </div>
              <button className="secondary-button" onClick={closeDayDetail} type="button">
                Cerrar
              </button>
            </header>

            {selectedDateEvents.length === 0 ? (
              <p className="muted calendar-detail-empty">No hay tareas ni citas para este dia.</p>
            ) : (
              <div className="calendar-detail-grid">
                <div className="calendar-detail-column">
                  <h4>Tareas</h4>
                  {selectedTaskEvents.length === 0 ? (
                    <p className="muted">Sin tareas.</p>
                  ) : (
                    <div className="calendar-detail-list">
                      {selectedTaskEvents.map((event) => (
                        <button
                          className="calendar-detail-item is-task is-clickable"
                          key={event.id}
                          onClick={() => openCalendarItemDetail(event)}
                          type="button"
                        >
                          <strong>{event.title}</strong>
                          <small>
                            Tarea
                            {event.priority ? ` · prioridad ${event.priority}` : ''}
                            {event.status ? ` · ${event.status}` : ''}
                          </small>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="calendar-detail-column">
                  <h4>Citas</h4>
                  {selectedAppointmentEvents.length === 0 ? (
                    <p className="muted">Sin citas.</p>
                  ) : (
                    <div className="calendar-detail-list">
                      {selectedAppointmentEvents.map((event) => (
                        <button
                          className="calendar-detail-item is-appointment is-clickable"
                          key={event.id}
                          onClick={() => openCalendarItemDetail(event)}
                          type="button"
                        >
                          <strong>{event.title}</strong>
                          <small>
                            Cita
                            {event.time ? ` · ${event.time}` : ''}
                          </small>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {!compact && isDetailOpen && selectedCalendarItem && (
        <div
          className="calendar-modal-overlay calendar-modal-overlay-secondary"
          onClick={() => setSelectedCalendarItem(null)}
          role="presentation"
        >
          <section
            aria-modal="true"
            className="calendar-modal calendar-item-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <header className="calendar-modal-header">
              <div>
                <h3>{selectedCalendarItem.type === 'task' ? 'Detalle de tarea' : 'Detalle de cita'}</h3>
                <p className="muted">{formatLongDate(selectedCalendarItem.dateKey)}</p>
              </div>
              <button
                className="secondary-button"
                onClick={() => setSelectedCalendarItem(null)}
                type="button"
              >
                Cerrar
              </button>
            </header>

            <div className="calendar-item-detail">
              <div className={`calendar-item-detail-card is-${selectedCalendarItem.type}`}>
                <strong className="calendar-item-detail-title">{selectedCalendarItem.title}</strong>

                <div className="calendar-item-detail-meta">
                  {selectedCalendarItem.type === 'task' ? (
                    <>
                      <span>Prioridad: {selectedCalendarItem.priority || 'Sin prioridad'}</span>
                      <span>Estado: {selectedCalendarItem.status || 'Pendiente'}</span>
                      <span>
                        Fecha:{' '}
                        {selectedCalendarItem.dateKey
                          ? formatLongDate(selectedCalendarItem.dateKey)
                          : 'Tarea sin fecha'}
                      </span>
                      <span>Destacada: {selectedCalendarItem.isFavorite ? 'Si' : 'No'}</span>
                      {selectedCalendarItem.completedAt && (
                        <span>Completada: {selectedCalendarItem.completedAt}</span>
                      )}
                    </>
                  ) : (
                    <>
                      <span>Fecha: {formatLongDate(selectedCalendarItem.dateKey)}</span>
                      <span>Hora: {selectedCalendarItem.time || 'Sin hora'}</span>
                      <span>Estado: {selectedCalendarItem.status || 'Programada'}</span>
                      {selectedCalendarItem.completedAt && (
                        <span>Completada: {selectedCalendarItem.completedAt}</span>
                      )}
                    </>
                  )}
                </div>

                <p className="calendar-item-detail-description">
                  {selectedCalendarItem.description || 'Sin descripcion.'}
                </p>
              </div>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
