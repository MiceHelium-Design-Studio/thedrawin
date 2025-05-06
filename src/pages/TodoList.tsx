
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface Todo {
  id: string;
  task: string;
  completed: boolean;
  user_id: string;
  created_at: string;
}

function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    getTodos();
  }, []);

  async function getTodos() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setTodos(data as Todo[]);
      }
    } catch (err) {
      console.error('Error fetching todos:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch todos');
      toast({
        variant: 'destructive',
        title: 'Error fetching todos',
        description: err instanceof Error ? err.message : 'Failed to fetch todos'
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const { error } = await supabase
        .from('todos')
        .insert([{ task: newTask.trim() }]);

      if (error) {
        throw error;
      }

      toast({
        title: 'Todo added',
        description: 'Your new task has been added successfully.'
      });
      
      setNewTask('');
      getTodos(); // Refresh the todo list
    } catch (err) {
      console.error('Error adding todo:', err);
      toast({
        variant: 'destructive',
        title: 'Error adding todo',
        description: err instanceof Error ? err.message : 'Failed to add todo'
      });
    }
  }

  async function toggleTodoCompletion(id: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ completed: !currentStatus })
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Update local state to reflect the change
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, completed: !currentStatus } : todo
      ));
      
      toast({
        title: 'Todo updated',
        description: `Task marked as ${!currentStatus ? 'completed' : 'incomplete'}.`
      });
    } catch (err) {
      console.error('Error updating todo:', err);
      toast({
        variant: 'destructive',
        title: 'Error updating todo',
        description: err instanceof Error ? err.message : 'Failed to update todo'
      });
    }
  }

  if (loading && todos.length === 0) {
    return <div className="p-4 flex justify-center">
      <div className="animate-pulse space-y-4 w-full max-w-md">
        <div className="h-8 bg-gray-300 rounded-md dark:bg-gray-700 w-3/4 mx-auto"></div>
        <div className="h-64 bg-gray-300 rounded-lg dark:bg-gray-700"></div>
      </div>
    </div>;
  }

  if (error && todos.length === 0) {
    return <div className="p-4 text-center">
      <h2 className="text-2xl font-semibold mb-4">Error Loading Todos</h2>
      <p className="text-red-500">{error}</p>
      <Button onClick={getTodos} className="mt-4">Retry</Button>
    </div>;
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Todo List</h2>
      
      <form onSubmit={handleAddTodo} className="mb-6 flex gap-2">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button type="submit">Add</Button>
      </form>
      
      {loading && <p className="text-gray-500">Refreshing...</p>}
      
      {todos.length === 0 ? (
        <p className="text-center py-8 text-gray-500">No todos found. Add some todos to get started.</p>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li 
              key={todo.id} 
              className={`p-3 border rounded-md flex justify-between items-center ${todo.completed ? 'bg-gray-50 text-gray-500' : ''}`}
            >
              <span className={todo.completed ? 'line-through' : ''}>
                {todo.task || 'Unnamed todo'}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => toggleTodoCompletion(todo.id, todo.completed)}
              >
                {todo.completed ? 'Undo' : 'Complete'}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TodoList;
