import React, { useState, useEffect, useMemo } from 'react';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import { Task } from './types';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      return JSON.parse(savedTasks);
    }
    return [];
  });

  // Filter States
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [dateSort, setDateSort] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (newTask: Task) => {
    setTasks([...tasks, newTask]);
  };

  const toggleTaskCompletion = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const editTask = (id: string, updatedTask: Partial<Task>) => {
    setTasks(
      tasks.map((task) => (task.id === id ? { ...task, ...updatedTask } : task))
    );
  };

  // Filtering and Sorting Logic
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Status Filter
        if (statusFilter === 'active' && task.completed) return false;
        if (statusFilter === 'completed' && !task.completed) return false;

        // Priority Filter
        if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

        return true;
      })
      .sort((a, b) => {
        // Date Sort
        const dateA = new Date(a.dueDate).getTime();
        const dateB = new Date(b.dueDate).getTime();
        
        if (dateSort === 'asc') {
          return dateA - dateB;
        } else {
          return dateB - dateA;
        }
      });
  }, [tasks, statusFilter, priorityFilter, dateSort]);

  return (
    <div className="app-container">
      <header>
        <h1>Task Manager</h1>
      </header>
      
      <main>
        <div className="controls-section">
          <TaskForm onAddTask={addTask} />
          
          <div className="filters-bar">
            <div className="filter-group">
              <label htmlFor="statusFilter">Status:</label>
              <select 
                id="statusFilter"
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'completed')}
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="priorityFilter">Priority:</label>
              <select 
                id="priorityFilter"
                value={priorityFilter} 
                onChange={(e) => setPriorityFilter(e.target.value as 'all' | 'low' | 'medium' | 'high')}
              >
                <option value="all">All</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="dateSort">Due Date:</label>
              <select 
                id="dateSort"
                value={dateSort} 
                onChange={(e) => setDateSort(e.target.value as 'asc' | 'desc')}
              >
                <option value="asc">Earliest First</option>
                <option value="desc">Latest First</option>
              </select>
            </div>
          </div>
        </div>

        <TaskList
          tasks={filteredTasks}
          onToggleCompletion={toggleTaskCompletion}
          onDelete={deleteTask}
          onEdit={editTask}
        />
      </main>
    </div>
  );
};

export default App;
