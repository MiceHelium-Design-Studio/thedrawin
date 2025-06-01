
import { sanitizeInput, validateInput } from '@/utils/securityUtils';
import { BannerValidationRules } from './types';

export const validateBannerTitle = async (title: string): Promise<boolean> => {
  if (!title) return true; // Optional field
  
  const sanitizedTitle = sanitizeInput(title);
  if (!sanitizedTitle) return true;
  
  return await validateInput({ 
    input: sanitizedTitle, 
    type: 'no_script', 
    maxLength: 200 
  });
};

export const validateBannerUrl = async (url: string): Promise<boolean> => {
  if (!url) return true; // Optional field
  
  const sanitizedUrl = sanitizeInput(url);
  if (!sanitizedUrl) return true;
  
  return await validateInput({ 
    input: sanitizedUrl, 
    type: 'url', 
    maxLength: 500 
  });
};

export const sanitizeBannerData = (data: any) => {
  return {
    title: data.title ? sanitizeInput(data.title) : undefined,
    linkUrl: data.linkUrl ? sanitizeInput(data.linkUrl) : undefined,
    imageUrl: sanitizeInput(data.imageUrl),
    active: data.active,
    position: data.position
  };
};
