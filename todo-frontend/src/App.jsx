import React, { useState, useEffect } from 'react';
import { login, getTasks, createTask } from './api/api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [username, setUsername] = useState('');

  // Charger les tâches si on est connecté
  useEffect(() => {
    if (token) fetchTasks();
  }, [token]);

  const fetchTasks = async () => {
    try {
      const response = await getTasks();
      setTasks(response.data);
    } catch (err) {
      if (err.response?.status === 403) handleLogout();
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await login(username, 'password_ignore'); // Simplifié pour l'exemple
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
    } catch (err) {
      alert("Erreur de connexion");
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    await createTask(newTaskTitle);
    setNewTaskTitle('');
    fetchTasks(); // Rafraîchir la liste (et vider le cache Redis côté backend)
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <form onSubmit={handleLogin} className="p-8 bg-white shadow-md rounded-lg">
          <h2 className="text-2xl mb-4 font-bold">Connexion</h2>
          <input 
            className="border p-2 w-full mb-4" 
            placeholder="Nom d'utilisateur"
            onChange={(e) => setUsername(e.target.useState)}
          />
          <button className="bg-blue-500 text-white px-4 py-2 rounded w-full">Se connecter</button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-xl rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-gray-800">Ma Todo List</h1>
        <button onClick={handleLogout} className="text-red-500 text-sm">Déconnexion</button>
      </div>

      <form onSubmit={handleAddTask} className="flex gap-2 mb-6">
        <input 
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          className="flex-1 border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Nouvelle tâche..."
        />
        <button className="bg-green-500 text-white px-4 py-2 rounded-lg">+</button>
      </form>

      <ul className="space-y-3">
        {tasks.map(task => (
          <li key={task.id} className="p-3 bg-gray-50 rounded-lg border flex items-center gap-3">
            <span className={task.completed ? 'line-through text-gray-400' : ''}>{task.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;