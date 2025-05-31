
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface AuditLogParams {
  action: string;
  tableName: string;
  recordId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
}

export interface ValidationParams {
  input: string;
  type?: 'general' | 'email' | 'url' | 'alphanumeric' | 'no_script';
  maxLength?: number;
}

/**
 * Log an audit event to the database using the secure function
 */
export const logAuditEvent = async (params: AuditLogParams): Promise<void> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user for audit log:', userError);
      return;
    }
    
    // Use the secure log_audit_event function
    const { error } = await supabase.rpc('log_audit_event', {
      p_action: params.action,
      p_table_name: params.tableName,
      p_record_id: params.recordId || null,
      p_old_values: params.oldValues ? JSON.parse(JSON.stringify(params.oldValues)) : null,
      p_new_values: params.newValues ? JSON.parse(JSON.stringify(params.newValues)) : null,
    });

    if (error) {
      console.error('Error logging audit event:', error);
    }
  } catch (error) {
    console.error('Unexpected error logging audit event:', error);
  }
};

/**
 * Client-side input validation
 */
export const validateInput = async (params: ValidationParams): Promise<boolean> => {
  try {
    const { input, type = 'general', maxLength = 1000 } = params;

    // Check length
    if (input.length > maxLength) {
      return false;
    }

    // Check for null or empty
    if (!input || input.trim() === '') {
      return false;
    }

    // Type-specific validation
    switch (type) {
      case 'email':
        return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(input);
      case 'url':
        return /^https?:\/\/[^\s/$.?#].[^\s]*$/.test(input);
      case 'alphanumeric':
        return /^[A-Za-z0-9\s]+$/.test(input);
      case 'no_script':
        return !/<script|javascript:|vbscript:|onload|onerror|onclick/i.test(input);
      default:
        // General validation - no malicious patterns
        return !/<script|javascript:|vbscript:|onload|onerror|onclick|<iframe|<object|<embed/i.test(input);
    }
  } catch (error) {
    console.error('Unexpected error validating input:', error);
    return false; // Default to invalid if there's an error
  }
};

/**
 * Simple security wrapper for operations
 */
export const withSecurityChecks = async <T>(
  operation: () => Promise<T>,
  options: {
    auditAction?: string;
    auditTableName?: string;
  }
): Promise<T> => {
  try {
    const result = await operation();

    // Audit logging for successful operations (only if user is authenticated)
    if (options.auditAction && options.auditTableName) {
      // Don't await audit logging to avoid blocking the operation
      logAuditEvent({
        action: options.auditAction,
        tableName: options.auditTableName,
      }).catch(error => {
        console.error('Failed to log audit event:', error);
      });
    }

    return result;
  } catch (error) {
    // Audit logging for failed operations (only if user is authenticated)
    if (options.auditAction && options.auditTableName) {
      // Don't await audit logging to avoid blocking error handling
      logAuditEvent({
        action: `${options.auditAction}_failed`,
        tableName: options.auditTableName,
        newValues: { error: error instanceof Error ? error.message : 'Unknown error' },
      }).catch(auditError => {
        console.error('Failed to log failed operation audit event:', auditError);
      });
    }
    throw error;
  }
};

/**
 * Client-side input sanitization (additional layer)
 */
export const sanitizeInput = (input: string): string => {
  // Remove potential XSS patterns
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};
