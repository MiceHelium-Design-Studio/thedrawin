
-- Add Row Level Security policies for notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own notifications and admin notifications
CREATE POLICY "Users can view their own notifications and admin notifications" 
ON public.notifications 
FOR SELECT 
USING (
  user_id = auth.uid() OR role = 'admin'
);

-- Policy for users to create their own notifications
CREATE POLICY "Users can create their own notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Policy for users to update their own notifications (mark as read, etc.)
CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (user_id = auth.uid());

-- Policy for users to delete their own notifications
CREATE POLICY "Users can delete their own notifications" 
ON public.notifications 
FOR DELETE 
USING (user_id = auth.uid());

-- Policy for admins to create admin notifications (system messages)
CREATE POLICY "Admins can create admin notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (
  role = 'admin' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);
