import fs from 'fs';
import path from 'path';
import { CoursesData, ProgressData, ApiResponse } from '@/types';

// File paths for our JSON databases
const UNITS_FILE_PATH = path.join(process.cwd(), 'src/data/units.json');
const PROGRESS_FILE_PATH = path.join(process.cwd(), 'src/data/progress.json');

/**
 * Read data from the units JSON file
 * @returns CoursesData object containing all course and unit information
 */
export const readUnitsData = (): CoursesData => {
  try {
    const fileData = fs.readFileSync(UNITS_FILE_PATH, 'utf-8');
    return JSON.parse(fileData) as CoursesData;
  } catch (error) {
    console.error('Error reading units data:', error);
    throw new Error('Failed to read units data');
  }
};

/**
 * Read data from the progress JSON file
 * @returns ProgressData object containing all user progress information
 */
export const readProgressData = (): ProgressData => {
  try {
    const fileData = fs.readFileSync(PROGRESS_FILE_PATH, 'utf-8');
    return JSON.parse(fileData) as ProgressData;
  } catch (error) {
    console.error('Error reading progress data:', error);
    throw new Error('Failed to read progress data');
  }
};

/**
 * Write updated progress data to the JSON file
 * @param data Updated ProgressData object
 * @returns boolean indicating success or failure
 */
export const writeProgressData = (data: ProgressData): boolean => {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    fs.writeFileSync(PROGRESS_FILE_PATH, jsonString, 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing progress data:', error);
    return false;
  }
};

/**
 * Create a standardized API response
 * @param success Whether the operation was successful
 * @param data Data to include in the response
 * @param error Optional error message
 * @returns Formatted API response
 */
export const createApiResponse = <T>(
  success: boolean,
  data: T | null,
  error?: string
): ApiResponse<T> => {
  return {
    success,
    data,
    error,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Utility to ensure write operations are atomic using a temporary file
 * @param filePath Path to the file being written
 * @param data Data to write
 * @returns boolean indicating success
 */
export const atomicWrite = (filePath: string, data: any): boolean => {
  const tempFilePath = `${filePath}.tmp`;
  
  try {
    // Write to temporary file first
    fs.writeFileSync(tempFilePath, JSON.stringify(data, null, 2), 'utf-8');
    
    // If successful, rename the temp file to the actual file
    fs.renameSync(tempFilePath, filePath);
    return true;
  } catch (error) {
    console.error(`Error in atomic write to ${filePath}:`, error);
    
    // Attempt to clean up temp file if it exists
    try {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    } catch (cleanupError) {
      console.error('Error cleaning up temporary file:', cleanupError);
    }
    
    return false;
  }
};

/**
 * Check if the data files exist, and create them with default content if they don't
 */
export const ensureDataFilesExist = (): void => {
  try {
    // Check if units data file exists
    if (!fs.existsSync(UNITS_FILE_PATH)) {
      // Create with empty structure
      const defaultUnitsData: CoursesData = { ap_courses: [] };
      fs.writeFileSync(UNITS_FILE_PATH, JSON.stringify(defaultUnitsData, null, 2), 'utf-8');
      console.log('Created default units data file');
    }
    
    // Check if progress data file exists
    if (!fs.existsSync(PROGRESS_FILE_PATH)) {
      // Create with empty structure
      const defaultProgressData: ProgressData = { users: [] };
      fs.writeFileSync(PROGRESS_FILE_PATH, JSON.stringify(defaultProgressData, null, 2), 'utf-8');
      console.log('Created default progress data file');
    }
  } catch (error) {
    console.error('Error ensuring data files exist:', error);
  }
};
