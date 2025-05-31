
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

export interface RateLimitConfig {
  limit: number;
  windowMinutes: number;
}

// Rate limiting configuration constants
export const RATE_LIMITS = {
  NOTIFICATION_SEND: {
    action: 'notification_send',
    limit: 10,
    windowMinutes: 60
  },
  BANNER_UPLOAD: {
    action: 'banner_upload',
    limit: 5,
    windowMinutes: 30
  },
  BANNER_CREATE: {
    action: 'banner_create',
    limit: 5,
    windowMinutes: 30
  },
  BANNER_UPDATE: {
    action: 'banner_update',
    limit: 10,
    windowMinutes: 30
  },
  BANNER_DELETE: {
    action: 'banner_delete',
    limit: 5,
    windowMinutes: 30
  },
  MEDIA_UPLOAD: {
    action: 'media_upload',
    limit: 20,
    windowMinutes: 60
  },
  MEDIA_DELETE: {
    action: 'media_delete',
    limit: 10,
    windowMinutes: 30
  }
};

/**
 * Log an audit event to the database using the secure function
 * Note: The log_audit_event function has a fixed search path for security
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
 * Check rate limit using the secure database function
 * Note: The check_rate_limit function has a fixed search path for security
 */
export const checkRateLimit = async (action: string, limit?: number, windowMinutes?: number): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_action: action,
      p_limit: limit || 10,
      p_window_minutes: windowMinutes || 60
    });

    if (error) {
      console.error('Error checking rate limit:', error);
      return false; // Default to not allowing if there's an error
    }

    return data as boolean;
  } catch (error) {
    console.error('Unexpected error checking rate limit:', error);
    return false;
  }
};

/**
 * Server-side input validation using the secure database function
 * Note: The validate_input function has a fixed search path for security
 */
export const validateInput = async (params: ValidationParams): Promise<boolean> => {
  try {
    const { input, type = 'general', maxLength = 1000 } = params;

    // Use the secure validate_input database function
    const { data, error } = await supabase.rpc('validate_input', {
      p_input: input,
      p_type: type,
      p_max_length: maxLength
    });

    if (error) {
      console.error('Error validating input:', error);
      return false; // Default to invalid if there's an error
    }

    return data as boolean;
  } catch (error) {
    console.error('Unexpected error validating input:', error);
    return false; // Default to invalid if there's an error
  }
};

/**
 * Security wrapper for operations with rate limiting and audit logging
 */
export const withSecurityChecks = async <T>(
  operation: () => Promise<T>,
  options: {
    auditAction?: string;
    auditTableName?: string;
    rateLimitAction?: string;
    rateLimitConfig?: RateLimitConfig;
  }
): Promise<T> => {
  try {
    // Check rate limit if configured
    if (options.rateLimitAction && options.rateLimitConfig) {
      const isAllowed = await checkRateLimit(
        options.rateLimitAction,
        options.rateLimitConfig.limit,
        options.rateLimitConfig.windowMinutes
      );
      
      if (!isAllowed) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
    }

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
