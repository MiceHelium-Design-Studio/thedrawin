
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, Circle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Todo {
  id: string;
  task: string;
  completed: boolean;
  created_at: string;
}

function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTask, setNewTask] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('todos').select('*');

      if (error) {
        throw error;
      }

      if (data) {
        setTodos(data as Todo[]);
      }
    } catch (err) {
      console.error('Error fetching todos:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch todos');
    } finally {
      setLoading(false);
    }
  }

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    try {
      const { error } = await supabase
        .from('todos')
        .insert([{ task: newTask.trim() }]);
      
      if (error) throw error;
      
      toast({
        title: "Todo added",
        description: "Your todo was added successfully",
      });
      
      setNewTask('');
      fetchTodos();
    } catch (err) {
      console.error('Error adding todo:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add todo",
      });
    }
  };

  const toggleTodoStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ completed: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, completed: !currentStatus } : todo
      ));
    } catch (err) {
      console.error('Error toggling todo status:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update todo status",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading todos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center bg-destructive/10 rounded-md border border-destructive text-destructive">
        <h3 className="font-medium">Error loading todos</h3>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Todo List</h1>
      
      <form onSubmit={handleAddTodo} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <Button type="submit">Add</Button>
      </form>

      {todos.length === 0 ? (
        <div className="text-center p-8 bg-muted/50 rounded-md">
          <p className="text-muted-foreground">No todos found. Add your first task above!</p>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Status</TableHead>
                <TableHead>Task</TableHead>
                <TableHead className="w-[150px]">Created At</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {todos.map((todo) => (
                <TableRow key={todo.id}>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => toggleTodoStatus(todo.id, todo.completed)}
                    >
                      {todo.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-300" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className={todo.completed ? "line-through text-muted-foreground" : ""}>
                    {todo.task}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(todo.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => toggleTodoStatus(todo.id, todo.completed)}
                    >
                      {todo.completed ? "Reopen" : "Complete"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default TodoPage;
