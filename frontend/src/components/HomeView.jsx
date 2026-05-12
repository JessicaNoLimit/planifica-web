import MonthlyCalendar from './MonthlyCalendar.jsx';

export default function HomeView({ tasks, appointments }) {
  const allPendingTasks = tasks.filter((task) => task.estado !== 'completada');
  const activeAppointments = appointments.filter((appointment) => appointment.estado !== 'completada');
  const pendingTasks = allPendingTasks
    .sort((a, b) => {
      const priorityOrder = { alta: 0, media: 1, baja: 2 };
      return priorityOrder[a.prioridad] - priorityOrder[b.prioridad];
    })
    .slice(0, 5);

  const nextAppointments = activeAppointments.slice(0, 3);

  return (
    <div className="summary-grid">
      <section className="panel summary-panel">
        <header className="panel-header">
          <h2>Tareas pendientes</h2>
          <span>{allPendingTasks.length}</span>
        </header>
        <div className="item-list">
          {pendingTasks.length === 0 && <p className="muted">No hay tareas pendientes.</p>}
          {pendingTasks.map((task) => (
            <article className="summary-item" key={task.id}>
              <strong>{task.titulo}</strong>
              <small>
                {task.prioridad} - {task.estado}
                {task.fecha ? ` - ${task.fecha}` : ''}
              </small>
            </article>
          ))}
        </div>
      </section>

      <section className="panel summary-panel">
        <header className="panel-header">
          <h2>Proximas citas</h2>
          <span>{nextAppointments.length}</span>
        </header>
        <div className="item-list">
          {nextAppointments.length === 0 && <p className="muted">No hay citas programadas.</p>}
          {nextAppointments.map((appointment) => (
            <article className="summary-item" key={appointment.id}>
              <strong>{appointment.titulo}</strong>
              <small>
                {appointment.fecha} - {appointment.hora}
              </small>
            </article>
          ))}
        </div>
      </section>

      <MonthlyCalendar appointments={appointments} compact tasks={tasks} />
    </div>
  );
}
