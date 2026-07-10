import { useEffect, useMemo, useState } from 'react';
import {
  createAppointment,
  deleteAppointment,
  fetchAppointments,
  updateAppointment
} from '../api/appointments.js';
import { createTask, deleteTask, fetchTasks, updateTask } from '../api/tasks.js';
import { generateDailyPlan } from '../api/ai.js';
import { updatePreferences } from '../api/auth.js';
import { useAuth } from '../context/AuthContext.jsx';
import AppointmentPanel from '../components/AppointmentPanel.jsx';
import CalendarPanel from '../components/CalendarPanel.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import HomeView from '../components/HomeView.jsx';
import LogoPlanifica from '../components/LogoPlanifica.jsx';
import TasksView from '../components/TasksView.jsx';

const phrases = [
  'Organiza el dia con intencion.',
  'Cada bloque claro reduce ruido mental.',
  'Prioriza lo importante y protege tu foco.',
  'Hoy cuenta: decide, ejecuta, ajusta.',
  'Haz que hoy cuente, aunque sea poco.',
  'No todo merece tu atención.',
  'Tu foco es limitado, protégelo.',
  'Menos decisiones, más ejecución.',
  'Empieza y ajusta sobre la marcha.',
  'No necesitas más ideas, necesitas acción.',
  'Cada día ordenado reduce el caos.',
  'La claridad elimina el estrés.',
  'Terminar algo pequeño ya es avanzar.',
  'No acumules, decide.',
  'Lo simple funciona.',
  'Tu sistema trabaja cuando tú no puedes.',
  'El orden no es lujo, es estrategia.',
  'Evita el ruido innecesario.',
  'Un paso claro vale más que diez dudas.',
  'Haz visible lo importante.',
  'No todo lo urgente es importante.',
  'Lo que no planificas te controla.',
  'Menos multitarea, más enfoque.',
  'Tu atención define tus resultados.',
  'Organizar es elegir.',
  'No dejes que el caos decida por ti.',
  'Cada tarea tiene su momento.',
  'Priorizar es renunciar.',
  'Lo importante suele ser incómodo.',
  'Empieza pequeño, termina fuerte.',
  'Un sistema claro reduce errores.',
  'No esperes ganas, crea estructura.',
  'Tu tiempo merece intención.',
  'Menos carga mental, más claridad.',
  'Decidir también es avanzar.',
  'Hazlo ahora o elimínalo.',
  'No llenes tu día, dirígelo.',
  'Cada decisión simplifica tu vida.',
  'La disciplina libera.',
  'No todo tiene que hacerse hoy.',
  'Avanza sin perfección.',
  'Ordena tu día antes de empezarlo.',
  'Tu energía es finita.',
  'Menos distracción, más progreso.',
  'Lo importante no se improvisa.',
  'Construye hábitos, no excusas.',
  'Un buen sistema evita el agotamiento.',
  'No acumules tareas abiertas.',
  'Haz espacio para pensar.',
  'Cada tarea cerrada es libertad.',
  'Planifica para respirar mejor.',
  'Tu mente necesita orden.',
  'Menos presión, más dirección.',
  'Lo que haces hoy importa.'
];

const neonPalette = [
  '#00F5FF',
  '#3B82F6',
  '#8B5CF6',
  '#D946EF',
  '#FF4FD8',
  '#22C55E',
  '#A3E635',
  '#FACC15',
  '#FB923C'
];

function capitalizeNameStart(value) {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function DashboardPage() {
  const { user, setUser, logout } = useAuth();
  const [activeView, setActiveView] = useState('inicio');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    titulo: '',
    descripcion: '',
    prioridad: 'media',
    estado: 'pendiente',
    fecha: ''
  });
  const [appointmentForm, setAppointmentForm] = useState({
    titulo: '',
    descripcion: '',
    fecha: '',
    hora: ''
  });
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [error, setError] = useState('');
  const [aiPlan, setAiPlan] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiGeneratedAt, setAiGeneratedAt] = useState(null);

  const phrase = useMemo(() => phrases[Math.floor(Math.random() * phrases.length)], []);

  useEffect(() => {
    loadWorkspace();
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    }

    function handleResize() {
      if (window.innerWidth >= 900) {
        setMobileMenuOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileMenuOpen]);

  function resetTaskForm() {
    setTaskForm({
      titulo: '',
      descripcion: '',
      prioridad: 'media',
      estado: 'pendiente',
      fecha: ''
    });
  }

  async function loadWorkspace() {
    try {
      const [taskData, appointmentData] = await Promise.all([fetchTasks(), fetchAppointments()]);
      setTasks(taskData.tasks);
      setAppointments(appointmentData.appointments);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreateTask(event) {
    event.preventDefault();
    setError('');

    try {
      if (editingTask) {
        const data = await updateTask(editingTask.id, taskForm);
        setTasks((current) =>
          current.map((item) => (item.id === editingTask.id ? data.task : item))
        );
        setEditingTask(null);
      } else {
        const data = await createTask(taskForm);
        setTasks((current) => [...current, data.task]);
      }

      resetTaskForm();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleToggleTask(task) {
    const nextState = task.estado === 'completada' ? 'pendiente' : 'completada';
    const data = await updateTask(task.id, { ...task, estado: nextState });
    setTasks((current) => current.map((item) => (item.id === task.id ? data.task : item)));
  }

  async function handleToggleFavorite(task) {
    const data = await updateTask(task.id, { ...task, is_favorite: !Boolean(task.is_favorite) });
    setTasks((current) => current.map((item) => (item.id === task.id ? data.task : item)));
  }

  async function handleDeleteTask(id) {
    await deleteTask(id);
    setTasks((current) => current.filter((task) => task.id !== id));
    if (editingTask?.id === id) {
      setEditingTask(null);
      resetTaskForm();
    }
  }

  function handleStartEditTask(task) {
    setEditingTask(task);
    setTaskForm({
      titulo: task.titulo || '',
      descripcion: task.descripcion || '',
      prioridad: task.prioridad || 'media',
      estado: task.estado || 'pendiente',
      fecha: task.fecha || ''
    });
  }

  function handleCancelEditTask() {
    setEditingTask(null);
    resetTaskForm();
  }

  async function handleCreateAppointment(event) {
    event.preventDefault();
    setError('');

    try {
      if (editingAppointment) {
        const data = await updateAppointment(editingAppointment.id, {
          ...editingAppointment,
          ...appointmentForm
        });
        setAppointments((current) =>
          current.map((item) => (item.id === editingAppointment.id ? data.appointment : item))
        );
      } else {
        const data = await createAppointment(appointmentForm);
        setAppointments((current) => [...current, data.appointment]);
      }

      setAppointmentForm({ titulo: '', descripcion: '', fecha: '', hora: '' });
      setEditingAppointment(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteAppointment(id) {
    await deleteAppointment(id);
    setAppointments((current) => current.filter((appointment) => appointment.id !== id));
    if (editingAppointment?.id === id) {
      setAppointmentForm({ titulo: '', descripcion: '', fecha: '', hora: '' });
      setEditingAppointment(null);
    }
  }

  function requestDeleteTask(id) {
    setConfirmDialog({
      type: 'task',
      id,
      title: 'Borrar tarea',
      message: 'Esta acción eliminará la tarea de forma permanente. No podrás recuperarla.'
    });
  }

  function requestDeleteAppointment(id) {
    setConfirmDialog({
      type: 'appointment',
      id,
      title: 'Borrar cita',
      message: 'Esta acción eliminará la cita de forma permanente. No podrás recuperarla.'
    });
  }

  function cancelDelete() {
    setConfirmDialog(null);
  }

  async function confirmDelete() {
    if (!confirmDialog) return;

    try {
      setError('');
      if (confirmDialog.type === 'task') {
        await handleDeleteTask(confirmDialog.id);
      }

      if (confirmDialog.type === 'appointment') {
        await handleDeleteAppointment(confirmDialog.id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setConfirmDialog(null);
    }
  }

  async function handleCompleteAppointment(appointment) {
    const data = await updateAppointment(appointment.id, {
      ...appointment,
      estado: 'completada'
    });
    setAppointments((current) =>
      current.map((item) => (item.id === appointment.id ? data.appointment : item))
    );
  }

  async function handleRecoverAppointment(appointment) {
    const data = await updateAppointment(appointment.id, {
      ...appointment,
      estado: 'programada'
    });
    setAppointments((current) =>
      current.map((item) => (item.id === appointment.id ? data.appointment : item))
    );
  }

  function handleStartEditAppointment(appointment) {
    setEditingAppointment(appointment);
    setAppointmentForm({
      titulo: appointment.titulo || '',
      descripcion: appointment.descripcion || '',
      fecha: appointment.fecha || '',
      hora: appointment.hora || ''
    });
  }

  function handleCancelEditAppointment() {
    setEditingAppointment(null);
    setAppointmentForm({ titulo: '', descripcion: '', fecha: '', hora: '' });
  }

  async function handleNeonChange(neon_color) {
    const data = await updatePreferences({ neon_color });
    setUser(data.user);
  }

  function handleSelectView(view) {
    setActiveView(view);
    setMobileMenuOpen(false);
  }

  function handleLogout() {
    setMobileMenuOpen(false);
    logout();
  }

  async function handleGenerateDailyPlan() {
    setAiLoading(true);
    setAiError('');

    try {
      const data = await generateDailyPlan();
      setAiPlan(data);
      setAiGeneratedAt(new Date());
    } catch (err) {
      setAiError(err.message || 'No se pudo generar el plan con IA.');
    } finally {
      setAiLoading(false);
    }
  }

  function renderActiveView() {
    if (activeView === 'tareas') {
      return (
        <TasksView
          editingTask={editingTask}
          tasks={tasks}
          form={taskForm}
          onCancelEdit={handleCancelEditTask}
          onFormChange={setTaskForm}
          onCreate={handleCreateTask}
          onToggle={handleToggleTask}
          onToggleFavorite={handleToggleFavorite}
          onDelete={requestDeleteTask}
          onEdit={handleStartEditTask}
        />
      );
    }

    if (activeView === 'calendario') {
      return (
        <div className="single-view">
          <CalendarPanel tasks={tasks} appointments={appointments} />
        </div>
      );
    }

    if (activeView === 'citas') {
      return (
        <div className="single-view">
          <AppointmentPanel
            tasks={tasks}
            appointments={appointments}
            editingAppointment={editingAppointment}
            form={appointmentForm}
            onCancelEdit={handleCancelEditAppointment}
            onComplete={handleCompleteAppointment}
            onFormChange={setAppointmentForm}
            onCreate={handleCreateAppointment}
            onDelete={requestDeleteAppointment}
            onEdit={handleStartEditAppointment}
            onRecover={handleRecoverAppointment}
          />
        </div>
      );
    }

    return <HomeView tasks={tasks} appointments={appointments} />;
  }

  const isHomeView = activeView === 'inicio';
  const formatGeneratedAt = (date) => {
    if (!date) return '';

    const pad = (value) => String(value).padStart(2, '0');
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    return `Generado el ${day}/${month}/${year} a las ${hours}:${minutes}`;
  };

  return (
    <main className="dashboard" style={{ '--accent': user.neon_color }}>
      <aside className="sidebar">
        <button
          className={`brand-button ${activeView === 'inicio' ? 'is-active' : ''}`}
          type="button"
          onClick={() => handleSelectView('inicio')}
          aria-label="Ir a Inicio"
        >
          <LogoPlanifica className="brand-logo" />
          <span>
            <strong>Planifica</strong>
            <small>Escritorio</small>
          </span>
        </button>
        <nav aria-label="Vistas">
          <button
            className={activeView === 'inicio' ? 'is-active' : ''}
            type="button"
            onClick={() => handleSelectView('inicio')}
          >
            Inicio
          </button>
          <button
            className={activeView === 'tareas' ? 'is-active' : ''}
            type="button"
            onClick={() => handleSelectView('tareas')}
          >
            Tareas
          </button>
          <button
            className={activeView === 'calendario' ? 'is-active' : ''}
            type="button"
            onClick={() => handleSelectView('calendario')}
          >
            Calendario
          </button>
          <button
            className={activeView === 'citas' ? 'is-active' : ''}
            type="button"
            onClick={() => handleSelectView('citas')}
          >
            Citas
          </button>
        </nav>
        <div className="color-control">
          <span>Neon</span>
          <div className="color-palette" aria-label="Seleccionar color neon">
            {neonPalette.map((color) => (
              <button
                aria-label={`Usar color ${color}`}
                className={user.neon_color.toUpperCase() === color ? 'is-selected' : ''}
                key={color}
                onClick={() => handleNeonChange(color)}
                style={{ '--swatch': color }}
                type="button"
              />
            ))}
          </div>
        </div>
        <button className="secondary-button" type="button" onClick={handleLogout}>
          Salir
        </button>
      </aside>

      <section className="workspace">
        <header className="dashboard-header">
          <div className="dashboard-header-content">
            <div>
              <h1 className="dashboard-title">Hola, {capitalizeNameStart(user.nombre)}</h1>
              <p className="dashboard-subtitle">{phrase}</p>
            </div>

            <button
              aria-controls="dashboard-mobile-drawer"
              aria-expanded={mobileMenuOpen}
              aria-label="Abrir navegación"
              className="dashboard-mobile-toggle"
              type="button"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
          <div className="dashboard-header-logo" aria-hidden="true">
            <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff2fd1" />
                  <stop offset="100%" stopColor="#00e5ff" />
                </linearGradient>

                <filter id="glow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <path
                d="M 0 220 Q 100 180 200 220 T 400 220"
                stroke="url(#neonGradient)"
                strokeWidth="3"
                fill="none"
                opacity="0.4"
                filter="url(#glow)"
              />

              <circle
                cx="200"
                cy="200"
                r="90"
                stroke="url(#neonGradient)"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                filter="url(#glow)"
              />

              <path
                d="M 160 200 L 190 230 L 250 170"
                stroke="url(#neonGradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glow)"
              />
            </svg>
          </div>
        </header>

        {error && <p className="error">{error}</p>}

        {isHomeView && (
          <section className="panel ai-panel">
            <div className="ai-panel-header">
              <div>
                <h2>Planificar mi día con IA</h2>
                <p className="muted">
                  Genera un resumen breve, prioridades y orden recomendado con tus tareas y citas.
                </p>
              </div>
              <button
                className="primary-button ai-action-button"
                type="button"
                onClick={handleGenerateDailyPlan}
                disabled={aiLoading}
              >
                {aiLoading ? 'Generando...' : '✨ Planificar mi día con IA'}
              </button>
            </div>

            {aiError && <p className="error">{aiError}</p>}

            {aiLoading && <p className="muted ai-loading">Analizando tareas y citas...</p>}

            {aiPlan && !aiLoading && !aiError && (
              <div className="ai-result">
                {aiGeneratedAt && (
                  <p className="ai-generated-at">{formatGeneratedAt(aiGeneratedAt)}</p>
                )}

                <div className="ai-result-block">
                  <h3>Resumen</h3>
                  <p>{aiPlan.summary}</p>
                </div>

                <div className="ai-result-block">
                  <h3>Prioridad principal</h3>
                  <p>{aiPlan.main_priority}</p>
                </div>

                <div className="ai-result-block">
                  <h3>Orden recomendado</h3>
                  <ol className="ai-list">
                    {Array.isArray(aiPlan.work_order) &&
                      aiPlan.work_order.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
                  </ol>
                </div>

                <div className="ai-result-block">
                  <h3>Advertencias</h3>
                  {Array.isArray(aiPlan.warnings) && aiPlan.warnings.length > 0 ? (
                    <ul className="ai-list">
                      {aiPlan.warnings.map((item, index) => (
                        <li key={`${item}-${index}`}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="muted">Sin advertencias destacables.</p>
                  )}
                </div>

                <div className="ai-result-block ai-tip">
                  <h3>Consejo</h3>
                  <p>{aiPlan.motivational_tip}</p>
                </div>
              </div>
            )}
          </section>
        )}

        {renderActiveView()}
      </section>

      {mobileMenuOpen && (
        <div
          className="dashboard-drawer-overlay"
          onClick={() => setMobileMenuOpen(false)}
          role="presentation"
        >
          <aside
            aria-label="Navegación del dashboard"
            aria-modal="true"
            className="sidebar dashboard-drawer"
            id="dashboard-mobile-drawer"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="dashboard-drawer-header">
              <button
                className="brand-button"
                type="button"
                onClick={() => handleSelectView('inicio')}
                aria-label="Ir a Inicio"
              >
                <LogoPlanifica className="brand-logo" />
                <span>
                  <strong>Planifica</strong>
                  <small>Escritorio</small>
                </span>
              </button>

              <button
                className="dashboard-drawer-close"
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Cerrar navegación"
              >
                ×
              </button>
            </div>

            <nav aria-label="Vistas">
              <button
                className={activeView === 'inicio' ? 'is-active' : ''}
                type="button"
                onClick={() => handleSelectView('inicio')}
              >
                Inicio
              </button>
              <button
                className={activeView === 'tareas' ? 'is-active' : ''}
                type="button"
                onClick={() => handleSelectView('tareas')}
              >
                Tareas
              </button>
              <button
                className={activeView === 'calendario' ? 'is-active' : ''}
                type="button"
                onClick={() => handleSelectView('calendario')}
              >
                Calendario
              </button>
              <button
                className={activeView === 'citas' ? 'is-active' : ''}
                type="button"
                onClick={() => handleSelectView('citas')}
              >
                Citas
              </button>
            </nav>

            <div className="color-control">
              <span>Neon</span>
              <div className="color-palette" aria-label="Seleccionar color neon">
                {neonPalette.map((color) => (
                  <button
                    aria-label={`Usar color ${color}`}
                    className={user.neon_color.toUpperCase() === color ? 'is-selected' : ''}
                    key={color}
                    onClick={() => handleNeonChange(color)}
                    style={{ '--swatch': color }}
                    type="button"
                  />
                ))}
              </div>
            </div>

            <button className="secondary-button" type="button" onClick={handleLogout}>
              Salir
            </button>
          </aside>
        </div>
      )}

      <ConfirmModal
        cancelText="Cancelar"
        confirmText="Borrar definitivamente"
        message={confirmDialog?.message || ''}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        open={Boolean(confirmDialog)}
        title={confirmDialog?.title || ''}
      />
    </main>
  );
}
