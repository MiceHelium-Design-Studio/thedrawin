
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface AuditLogParams {
  action: string;
  tableName: string;
  recordId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
}

export interface RateLimitParams {
  action: string;
  limit?: number;
  windowMinutes?: number;
}

export interface ValidationParams {
  input: string;
  type?: 'general' | 'email' | 'url' | 'alphanumeric' | 'no_script';
  maxLength?: number;
}

/**
 * Log an audit event to the database
 */
export const logAuditEvent = async (params: AuditLogParams): Promise<void> => {
  try {
    const { error } = await supabase.rpc('log_audit_event', {
      p_action: params.action,
      p_table_name: params.tableName,
      p_record_id: params.recordId || null,
      p_old_values: params.oldValues ? JSON.stringify(params.oldValues) : null,
      p_new_values: params.newValues ? JSON.stringify(params.newValues) : null,
    });

    if (error) {
      console.error('Error logging audit event:', error);
    }
  } catch (error) {
    console.error('Unexpected error logging audit event:', error);
  }
};

/**
 * Check if the current user has exceeded the rate limit for a specific action
 */
export const checkRateLimit = async (params: RateLimitParams): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_action: params.action,
      p_limit: params.limit || 10,
      p_window_minutes: params.windowMinutes || 60,
    });

    if (error) {
      console.error('Error checking rate limit:', error);
      return false; // Default to blocking if there's an error
    }

    return data as boolean;
  } catch (error) {
    console.error('Unexpected error checking rate limit:', error);
    return false; // Default to blocking if there's an error
  }
};

/**
 * Validate user input using server-side validation
 */
export const validateInput = async (params: ValidationParams): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('validate_input', {
      p_input: params.input,
      p_type: params.type || 'general',
      p_max_length: params.maxLength || 1000,
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
 * Enhanced security wrapper for sensitive operations
 */
export const withSecurityChecks = async <T>(
  operation: () => Promise<T>,
  options: {
    rateLimitAction?: string;
    auditAction?: string;
    auditTableName?: string;
    rateLimitConfig?: { limit: number; windowMinutes: number };
  }
): Promise<T> => {
  // Rate limiting check
  if (options.rateLimitAction) {
    const isAllowed = await checkRateLimit({
      action: options.rateLimitAction,
      limit: options.rateLimitConfig?.limit,
      windowMinutes: options.rateLimitConfig?.windowMinutes,
    });

    if (!isAllowed) {
      toast({
        variant: 'destructive',
        title: 'Rate limit exceeded',
        description: 'You are performing this action too frequently. Please wait before trying again.',
      });
      throw new Error('Rate limit exceeded');
    }
  }

  try {
    const result = await operation();

    // Audit logging for successful operations
    if (options.auditAction && options.auditTableName) {
      await logAuditEvent({
        action: options.auditAction,
        tableName: options.auditTableName,
      });
    }

    return result;
  } catch (error) {
    // Audit logging for failed operations
    if (options.auditAction && options.auditTableName) {
      await logAuditEvent({
        action: `${options.auditAction}_failed`,
        tableName: options.auditTableName,
        newValues: { error: error instanceof Error ? error.message : 'Unknown error' },
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

/**
 * Rate limit constants for different actions
 */
export const RATE_LIMITS = {
  BANNER_CREATE: { action: 'banner_create', limit: 5, windowMinutes: 60 },
  BANNER_UPDATE: { action: 'banner_update', limit: 10, windowMinutes: 60 },
  BANNER_DELETE: { action: 'banner_delete', limit: 3, windowMinutes: 60 },
  MEDIA_UPLOAD: { action: 'media_upload', limit: 20, windowMinutes: 60 },
  MEDIA_DELETE: { action: 'media_delete', limit: 10, windowMinutes: 60 },
  NOTIFICATION_SEND: { action: 'notification_send', limit: 50, windowMinutes: 60 },
} as const;
