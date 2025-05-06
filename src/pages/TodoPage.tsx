
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

function TodoPage() {
  const [todos, setTodos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getTodos() {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('todos').select('*');

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          setTodos(data);
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
    return <div className="p-4 text-center">Loading todos...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Todo List</h1>
      {todos.length === 0 ? (
        <p>No todos found</p>
      ) : (
        <ul className="list-disc pl-5 space-y-2">
          {todos.map((todo) => (
            <li key={todo.id} className="p-2 border-b">
              {todo.task}
              {todo.completed && <span className="ml-2 text-green-500">(Completed)</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TodoPage;
