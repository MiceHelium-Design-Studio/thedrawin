
import { Draw, Banner } from './types';

export async function createDraw(draw: Omit<Draw, 'id'>) {
  // This is a mock implementation
  return { ...draw, id: Date.now().toString() };
}

export async function updateDraw(id: string, draw: Partial<Draw>) {
  // This is a mock implementation
  return { ...draw, id };
}

export async function createBanner(banner: Omit<Banner, 'id'>) {
  // This is a mock implementation
  return { ...banner, id: Date.now().toString() };
}

export async function updateBanner(id: string, banner: Partial<Banner>) {
  // This is a mock implementation
  return { ...banner, id };
}

export async function deleteBanner(id: string) {
  // This is a mock implementation
  return true;
}
