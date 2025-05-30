import { ApiResponse } from '@/types';

// Import server actions for file operations
import { 
  readUnitsData as readServerUnitsData, 
  readProgressData as readServerProgressData, 
  writeProgressData as writeServerProgressData,
  ensureDataFilesExist as ensureServerDataFilesExist
} from '@/lib/server/actions';

// Re-export the server actions
export const readUnitsData = readServerUnitsData;
export const readProgressData = readServerProgressData;
export const writeProgressData = writeServerProgressData;
export const ensureDataFilesExist = ensureServerDataFilesExist;

/**
 * Create a standardized API response
 * @param success Whether the operation was successful
 * @param data Data to include in the response
 * @param error Optional error message
 * @returns Formatted API response
 */
export function createApiResponse<T>(
  success: boolean,
  data: T | null,
  error?: string
): ApiResponse<T> {
  return {
    success,
    data,
    error: error || undefined,
    timestamp: new Date().toISOString()
  };
}
