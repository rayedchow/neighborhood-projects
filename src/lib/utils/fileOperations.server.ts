import fs from 'fs';
import path from 'path';
import { CoursesData, ProgressData, ApiResponse } from '@/types';

// File paths for our JSON databases
const UNITS_FILE_PATH = path.join(process.cwd(), 'src/data/units.json');
const PROGRESS_FILE_PATH = path.join(process.cwd(), 'src/data/progress.json');
const FLASHCARDS_DATA_PATH = path.join(process.cwd(), 'src/data/flashcards.json');
const STUDY_SESSIONS_DATA_PATH = path.join(process.cwd(), 'src/data/study-sessions.json');
const STUDY_GOALS_DATA_PATH = path.join(process.cwd(), 'src/data/study-goals.json');

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

    // Check if flashcards data file exists
    if (!fs.existsSync(FLASHCARDS_DATA_PATH)) {
      const defaultFlashcardsData = { cards: [], decks: [] };
      fs.writeFileSync(FLASHCARDS_DATA_PATH, JSON.stringify(defaultFlashcardsData, null, 2));
      console.log('Created default flashcards data file');
    }

    // Check if study sessions data file exists
    if (!fs.existsSync(STUDY_SESSIONS_DATA_PATH)) {
      const defaultStudySessionsData = { sessions: [] };
      fs.writeFileSync(STUDY_SESSIONS_DATA_PATH, JSON.stringify(defaultStudySessionsData, null, 2));
      console.log('Created default study sessions data file');
    }

    // Check if study goals data file exists
    if (!fs.existsSync(STUDY_GOALS_DATA_PATH)) {
      const defaultStudyGoalsData = { goals: [] };
      fs.writeFileSync(STUDY_GOALS_DATA_PATH, JSON.stringify(defaultStudyGoalsData, null, 2));
      console.log('Created default study goals data file');
    }
  } catch (error) {
    console.error('Error ensuring data files exist:', error);
  }
};

// Generic file operations for any data file

/**
 * Read data from any JSON file
 * @param filePath Path to the JSON file
 * @returns Parsed data from the file
 */
export function readJsonFile<T>(filePath: string): T {
  try {
    // Create file with default data if it doesn't exist
    if (!fs.existsSync(filePath)) {
      throw new Error(`File does not exist: ${filePath}`);
    }
    
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) as T;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    throw new Error(`Failed to read data from ${filePath}`);
  }
}

/**
 * Write data to any JSON file
 * @param filePath Path to the JSON file
 * @param data Data to write to the file
 * @returns boolean indicating success or failure
 */
export function writeJsonFile<T>(filePath: string, data: T): boolean {
  try {
    const dirPath = path.dirname(filePath);
    
    // Ensure directory exists
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing to file ${filePath}:`, error);
    return false;
  }
}

/**
 * Read flashcards data from file
 * @returns Flashcards data
 */
export function readFlashcardsData<T>(): T {
  return readJsonFile<T>(FLASHCARDS_DATA_PATH);
}

/**
 * Write flashcards data to file
 * @param data Flashcards data to write
 * @returns boolean indicating success or failure
 */
export function writeFlashcardsData<T>(data: T): boolean {
  return writeJsonFile(FLASHCARDS_DATA_PATH, data);
}

/**
 * Read study sessions data from file
 * @returns Study sessions data
 */
export function readStudySessionsData<T>(): T {
  return readJsonFile<T>(STUDY_SESSIONS_DATA_PATH);
}

/**
 * Write study sessions data to file
 * @param data Study sessions data to write
 * @returns boolean indicating success or failure
 */
export function writeStudySessionsData<T>(data: T): boolean {
  return writeJsonFile(STUDY_SESSIONS_DATA_PATH, data);
}

/**
 * Read study goals data from file
 * @returns Study goals data
 */
export function readStudyGoalsData<T>(): T {
  return readJsonFile<T>(STUDY_GOALS_DATA_PATH);
}

/**
 * Write study goals data to file
 * @param data Study goals data to write
 * @returns boolean indicating success or failure
 */
export function writeStudyGoalsData<T>(data: T): boolean {
  return writeJsonFile(STUDY_GOALS_DATA_PATH, data);
}
