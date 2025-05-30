'use server';

import fs from 'fs';
import path from 'path';
import { CoursesData, ProgressData, ApiResponse } from '@/types';

// File paths for our JSON databases
const UNITS_FILE_PATH = path.join(process.cwd(), 'src/data/units.json');
const PROGRESS_FILE_PATH = path.join(process.cwd(), 'src/data/progress.json');
const FLASHCARDS_DATA_PATH = path.join(process.cwd(), 'src/data/flashcards.json');
const STUDY_SESSIONS_DATA_PATH = path.join(process.cwd(), 'src/data/study-sessions.json');
const STUDY_GOALS_DATA_PATH = path.join(process.cwd(), 'src/data/study-goals.json');

// Generic file operations

/**
 * Read data from any JSON file
 * @param filePath Path to the JSON file
 * @returns Parsed data from the file
 */
export async function readJsonFile<T>(filePath: string): Promise<T> {
  try {
    // Create file with default data if it doesn't exist
    if (!fs.existsSync(filePath)) {
      throw new Error(`File does not exist: ${filePath}`);
    }
    
    const data = await fs.promises.readFile(filePath, 'utf-8');
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
export async function writeJsonFile<T>(filePath: string, data: T): Promise<boolean> {
  try {
    const dirPath = path.dirname(filePath);
    
    // Ensure directory exists
    if (!fs.existsSync(dirPath)) {
      await fs.promises.mkdir(dirPath, { recursive: true });
    }
    
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing to file ${filePath}:`, error);
    return false;
  }
}

/**
 * Check if the data files exist, and create them with default content if they don't
 */
export async function ensureDataFilesExist(): Promise<void> {
  try {
    // Check if units data file exists
    if (!fs.existsSync(UNITS_FILE_PATH)) {
      // Create with empty structure
      const defaultUnitsData: CoursesData = { ap_courses: [] };
      await fs.promises.writeFile(UNITS_FILE_PATH, JSON.stringify(defaultUnitsData, null, 2), 'utf-8');
      console.log('Created default units data file');
    }
    
    // Check if progress data file exists
    if (!fs.existsSync(PROGRESS_FILE_PATH)) {
      // Create with empty structure
      const defaultProgressData: ProgressData = { users: [] };
      await fs.promises.writeFile(PROGRESS_FILE_PATH, JSON.stringify(defaultProgressData, null, 2), 'utf-8');
      console.log('Created default progress data file');
    }

    // Check if flashcards data file exists
    if (!fs.existsSync(FLASHCARDS_DATA_PATH)) {
      const defaultFlashcardsData = { cards: [], decks: [] };
      await fs.promises.writeFile(FLASHCARDS_DATA_PATH, JSON.stringify(defaultFlashcardsData, null, 2));
      console.log('Created default flashcards data file');
    }

    // Check if study sessions data file exists
    if (!fs.existsSync(STUDY_SESSIONS_DATA_PATH)) {
      const defaultStudySessionsData = { sessions: [] };
      await fs.promises.writeFile(STUDY_SESSIONS_DATA_PATH, JSON.stringify(defaultStudySessionsData, null, 2));
      console.log('Created default study sessions data file');
    }

    // Check if study goals data file exists
    if (!fs.existsSync(STUDY_GOALS_DATA_PATH)) {
      const defaultStudyGoalsData = { goals: [] };
      await fs.promises.writeFile(STUDY_GOALS_DATA_PATH, JSON.stringify(defaultStudyGoalsData, null, 2));
      console.log('Created default study goals data file');
    }
  } catch (error) {
    console.error('Error ensuring data files exist:', error);
  }
}

// Specific data file operations

/**
 * Read units data
 */
export async function readUnitsData(): Promise<CoursesData> {
  return await readJsonFile<CoursesData>(UNITS_FILE_PATH);
}

/**
 * Read progress data
 */
export async function readProgressData(): Promise<ProgressData> {
  return await readJsonFile<ProgressData>(PROGRESS_FILE_PATH);
}

/**
 * Write progress data
 */
export async function writeProgressData(data: ProgressData): Promise<boolean> {
  return await writeJsonFile<ProgressData>(PROGRESS_FILE_PATH, data);
}

/**
 * Read flashcards data
 */
export async function readFlashcardsData<T>(): Promise<T> {
  return await readJsonFile<T>(FLASHCARDS_DATA_PATH);
}

/**
 * Write flashcards data
 */
export async function writeFlashcardsData<T>(data: T): Promise<boolean> {
  return await writeJsonFile<T>(FLASHCARDS_DATA_PATH, data);
}

/**
 * Read study sessions data
 */
export async function readStudySessionsData<T>(): Promise<T> {
  return await readJsonFile<T>(STUDY_SESSIONS_DATA_PATH);
}

/**
 * Write study sessions data
 */
export async function writeStudySessionsData<T>(data: T): Promise<boolean> {
  return await writeJsonFile<T>(STUDY_SESSIONS_DATA_PATH, data);
}

/**
 * Read study goals data
 */
export async function readStudyGoalsData<T>(): Promise<T> {
  return await readJsonFile<T>(STUDY_GOALS_DATA_PATH);
}

/**
 * Write study goals data
 */
export async function writeStudyGoalsData<T>(data: T): Promise<boolean> {
  return await writeJsonFile<T>(STUDY_GOALS_DATA_PATH, data);
}
