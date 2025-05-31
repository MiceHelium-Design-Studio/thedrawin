
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
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        action: params.action,
        table_name: params.tableName,
        record_id: params.recordId || null,
        old_values: params.oldValues ? JSON.parse(JSON.stringify(params.oldValues)) : null,
        new_values: params.newValues ? JSON.parse(JSON.stringify(params.newValues)) : null,
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
    const limit = params.limit || 10;
    const windowMinutes = params.windowMinutes || 60;
    const now = new Date();
    const windowStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      Math.floor(now.getMinutes() / windowMinutes) * windowMinutes
    );

    // Get current count for this user, action, and window
    const { data: existingLimit, error } = await supabase
      .from('rate_limits')
      .select('count')
      .eq('action', params.action)
      .eq('window_start', windowStart.toISOString())
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error checking rate limit:', error);
      return false; // Default to blocking if there's an error
    }

    const currentCount = existingLimit?.count || 0;

    // Check if limit exceeded
    if (currentCount >= limit) {
      return false;
    }

    // Update or insert rate limit record
    const { error: upsertError } = await supabase
      .from('rate_limits')
      .upsert({
        action: params.action,
        count: currentCount + 1,
        window_start: windowStart.toISOString(),
      }, {
        onConflict: 'user_id,action,window_start'
      });

    if (upsertError) {
      console.error('Error updating rate limit:', upsertError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error checking rate limit:', error);
    return false; // Default to blocking if there's an error
  }
};

/**
 * Validate user input using client-side validation
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
