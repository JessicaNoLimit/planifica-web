import StarIcon from './StarIcon.jsx';
import { formatSpanishDateShort, formatSpanishDateTime } from '../utils/formatters.js';

export default function TaskPanel({
  activeFilter,
  editingTask,
  emptyMessage,
  filters,
  tasks,
  form,
  onCancelEdit,
  onFormChange,
  onCreate,
  onEdit,
  onToggle,
  onToggleFavorite,
  onDelete,
  onFilterChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  priorityFilter,
  onPriorityFilterChange
}) {
  function updateField(event) {
    onFormChange((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  return (
    <div className="stacked-panels">
      <section className="panel">
        <header className="panel-header">
          <h2>{editingTask ? 'Editar tarea' : 'Crear tarea'}</h2>
        </header>

        <form className="compact-form" onSubmit={onCreate}>
          <input
            name="titulo"
            placeholder="Nueva tarea"
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
            <select name="prioridad" value={form.prioridad} onChange={updateField}>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
            <select name="estado" value={form.estado} onChange={updateField}>
              <option value="pendiente">Pendiente</option>
              <option value="en_progreso">En progreso</option>
              <option value="completada">Completada</option>
            </select>
            <input name="fecha" type="date" value={form.fecha} onChange={updateField} />
          </div>
          <div className="task-form-actions">
            <button className="primary-button" type="submit">
              {editingTask ? 'Guardar cambios' : 'Crear tarea'}
            </button>
            {editingTask && (
              <button className="secondary-button" onClick={onCancelEdit} type="button">
                Cancelar edición
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="panel">
        <header className="panel-header">
          <h2>Lista de tareas</h2>
          <span>{tasks.length}</span>
        </header>

        <div className="task-tabs" role="tablist" aria-label="Filtros de tareas">
          {filters.map((filter) => (
            <button
              className={activeFilter === filter.id ? 'is-active' : ''}
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              role="tab"
              type="button"
            >
              {filter.label}
              <small>{filter.count}</small>
            </button>
          ))}
        </div>

        <div className="task-toolbar">
          <label className="task-search">
            <span>Buscar</span>
            <input
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Buscar por titulo o descripcion"
              type="search"
              value={searchQuery}
            />
          </label>

          <label className="task-filter-control">
            <span>Ordenar</span>
            <select onChange={(event) => onSortChange(event.target.value)} value={sortBy}>
              <option value="prioridad">Prioridad</option>
              <option value="fecha">Fecha</option>
              <option value="recent">Mas recientes</option>
              <option value="nombre">Nombre</option>
            </select>
          </label>

          <label className="task-filter-control">
            <span>Prioridad</span>
            <select onChange={(event) => onPriorityFilterChange(event.target.value)} value={priorityFilter}>
              <option value="todas">Todas las prioridades</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </label>
        </div>

        <div className="item-list">
          {tasks.length === 0 && <p className="muted task-empty-state">{emptyMessage}</p>}
          {tasks.map((task) => (
            <article className={`item ${task.estado === 'completada' ? 'is-done' : ''}`} key={task.id}>
              <div>
                <div className="task-title-row">
                  <button
                    aria-label={task.is_favorite ? 'Quitar de favoritas' : 'Marcar como favorita'}
                    className={`favorite-button ${task.is_favorite ? 'is-favorite' : ''}`}
                    onClick={() => onToggleFavorite(task)}
                    type="button"
                  >
                    <StarIcon className="favorite-icon" filled={Boolean(task.is_favorite)} />
                  </button>
                  <h3>{task.titulo}</h3>
                </div>
                {task.descripcion && <p>{task.descripcion}</p>}
                <div className="task-meta-row">
                  <small className={`task-priority-badge is-${task.prioridad}`}>{task.prioridad}</small>
                  <small>{task.estado}</small>
                  <small>{task.fecha ? formatSpanishDateShort(task.fecha) : 'Sin fecha limite'}</small>
                  {task.completed_at && (
                    <small>completada: {formatSpanishDateTime(task.completed_at)}</small>
                  )}
                </div>
              </div>
              <div className="item-actions">
                <button type="button" onClick={() => onEdit(task)}>
                  Editar
                </button>
                <button type="button" onClick={() => onToggle(task)}>
                  {task.estado === 'completada' ? 'Reabrir' : 'Completar'}
                </button>
                <button type="button" onClick={() => onDelete(task.id)}>
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
