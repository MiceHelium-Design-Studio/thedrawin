
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Todo {
  id: string;
  task: string;
  completed: boolean;
}

function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getTodos() {
      try {
        const { data, error } = await supabase.from('todos').select('*');
        
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          setTodos(data as Todo[]);
        }
      } catch (err) {
        console.error('Error fetching todos:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch todos');
      } finally {
        setLoading(false);
      }
    }

    getTodos();
  }, []);

  if (loading) {
    return <div>Loading todos...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Todo List</h2>
      {todos.length === 0 ? (
        <p>No todos found. Add some todos to get started.</p>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li 
              key={todo.id} 
              className={`p-3 border rounded-md ${todo.completed ? 'bg-gray-100 line-through' : ''}`}
            >
              {todo.task || 'Unnamed todo'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TodoList;
