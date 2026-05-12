import { useMemo, useState } from 'react';
import TaskPanel from './TaskPanel.jsx';

const PRIORITY_ORDER = { alta: 0, media: 1, baja: 2 };

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function compareByPriority(a, b) {
  return (PRIORITY_ORDER[a.prioridad] ?? 99) - (PRIORITY_ORDER[b.prioridad] ?? 99);
}

function compareByDate(a, b) {
  if (a.fecha && b.fecha) return a.fecha.localeCompare(b.fecha);
  if (a.fecha) return -1;
  if (b.fecha) return 1;
  return 0;
}

function compareByRecent(a, b) {
  if (a.created_at && b.created_at) return String(b.created_at).localeCompare(String(a.created_at));
  return (b.id ?? 0) - (a.id ?? 0);
}

function sortTasks(tasks, sortBy, activeFilter, todayKey) {
  const sorted = [...tasks];

  if (activeFilter === 'hoy') {
    const getTodayBucket = (task) => {
      const isCompleted = task.estado === 'completada';
      if (isCompleted) return 99;
      if (task.fecha === todayKey) return 0;
      if (!task.fecha) return 1;
      return 2;
    };

    sorted.sort((a, b) => {
      const bucketDiff = getTodayBucket(a) - getTodayBucket(b);
      if (bucketDiff !== 0) return bucketDiff;
      const dateDiff = compareByDate(a, b);
      if (dateDiff !== 0) return dateDiff;
      const priorityDiff = compareByPriority(a, b);
      if (priorityDiff !== 0) return priorityDiff;
      return a.titulo.localeCompare(b.titulo, 'es', { sensitivity: 'base' });
    });
    return sorted;
  }

  sorted.sort((a, b) => {
    if (activeFilter === 'importantes') {
      const completedDiff = Number(a.estado === 'completada') - Number(b.estado === 'completada');
      if (completedDiff !== 0) return completedDiff;
    }

    if (activeFilter === 'archivo') {
      const completedAtA = a.completed_at || '';
      const completedAtB = b.completed_at || '';
      if (completedAtA && completedAtB && completedAtA !== completedAtB) {
        return completedAtB.localeCompare(completedAtA);
      }
    }

    if (sortBy === 'prioridad') {
      const priorityDiff = compareByPriority(a, b);
      if (priorityDiff !== 0) return priorityDiff;
      const dateDiff = compareByDate(a, b);
      if (dateDiff !== 0) return dateDiff;
      return a.titulo.localeCompare(b.titulo, 'es', { sensitivity: 'base' });
    }

    if (sortBy === 'fecha') {
      const dateDiff = compareByDate(a, b);
      if (dateDiff !== 0) return dateDiff;
      const priorityDiff = compareByPriority(a, b);
      if (priorityDiff !== 0) return priorityDiff;
      return a.titulo.localeCompare(b.titulo, 'es', { sensitivity: 'base' });
    }

    if (sortBy === 'nombre') {
      return a.titulo.localeCompare(b.titulo, 'es', { sensitivity: 'base' });
    }

    const recentDiff = compareByRecent(a, b);
    if (recentDiff !== 0) return recentDiff;
    return a.titulo.localeCompare(b.titulo, 'es', { sensitivity: 'base' });
  });

  return sorted;
}

export default function TasksView({
  editingTask,
  tasks,
  form,
  onCancelEdit,
  onFormChange,
  onCreate,
  onToggle,
  onToggleFavorite,
  onDelete,
  onEdit
}) {
  const [activeFilter, setActiveFilter] = useState('hoy');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('prioridad');
  const [priorityFilter, setPriorityFilter] = useState('todas');

  const todayKey = useMemo(() => getTodayKey(), []);

  const groupedTasks = useMemo(() => {
    const pendingTasks = tasks.filter((task) => task.estado !== 'completada');
    const completedTasks = tasks.filter((task) => task.estado === 'completada');

    return {
      hoy: pendingTasks.filter((task) => task.fecha === todayKey || !task.fecha),
      importantes: tasks.filter((task) => Boolean(task.is_favorite)),
      pendientes: pendingTasks,
      archivo: completedTasks
    };
  }, [tasks, todayKey]);

  const filters = useMemo(
    () => [
      { id: 'hoy', label: 'Hoy', count: groupedTasks.hoy.length },
      {
        id: 'importantes',
        label: 'Destacadas',
        count: groupedTasks.importantes.filter((task) => task.estado !== 'completada').length
      },
      { id: 'pendientes', label: 'Pendientes', count: groupedTasks.pendientes.length },
      { id: 'archivo', label: 'Archivo', count: groupedTasks.archivo.length }
    ],
    [groupedTasks]
  );

  const emptyMessages = {
    hoy: 'No tienes tareas urgentes para hoy.',
    importantes: 'Marca tareas con la estrella para encontrarlas rapido.',
    pendientes: 'No hay tareas pendientes.',
    archivo: 'Aun no has completado tareas.'
  };

  const filteredTasks = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const baseTasks = groupedTasks[activeFilter] || [];

    const searchedTasks = baseTasks.filter((task) => {
      if (!normalizedQuery) return true;
      return (
        task.titulo.toLowerCase().includes(normalizedQuery) ||
        String(task.descripcion || '').toLowerCase().includes(normalizedQuery)
      );
    });

    const priorityTasks = searchedTasks.filter((task) => {
      if (priorityFilter === 'todas') return true;
      return task.prioridad === priorityFilter;
    });

    return sortTasks(priorityTasks, sortBy, activeFilter, todayKey);
  }, [activeFilter, groupedTasks, priorityFilter, searchQuery, sortBy, todayKey]);

  return (
    <div className="single-view">
      <TaskPanel
        activeFilter={activeFilter}
        editingTask={editingTask}
        emptyMessage={emptyMessages[activeFilter]}
        filters={filters}
        form={form}
        onCancelEdit={onCancelEdit}
        onCreate={onCreate}
        onDelete={onDelete}
        onEdit={onEdit}
        onFilterChange={setActiveFilter}
        onFormChange={onFormChange}
        onSearchChange={setSearchQuery}
        onSortChange={setSortBy}
        onToggle={onToggle}
        onToggleFavorite={onToggleFavorite}
        onPriorityFilterChange={setPriorityFilter}
        priorityFilter={priorityFilter}
        searchQuery={searchQuery}
        sortBy={sortBy}
        tasks={filteredTasks}
      />
    </div>
  );
}
