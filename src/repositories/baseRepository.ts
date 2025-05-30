import fs from 'fs';
import path from 'path';

/**
 * Base repository class that handles file operations
 */
export class BaseRepository<T> {
  protected filePath: string;

  constructor(fileName: string) {
    this.filePath = path.join(process.cwd(), 'src/data', fileName);
  }

  /**
   * Read data from the JSON file
   */
  protected readData(): T {
    try {
      const fileData = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(fileData) as T;
    } catch (error) {
      console.error(`Error reading data from ${this.filePath}:`, error);
      throw new Error(`Failed to read data from ${this.filePath}`);
    }
  }

  /**
   * Write data to the JSON file
   */
  protected writeData(data: T): boolean {
    try {
      // Create a temporary file path
      const tempPath = `${this.filePath}.tmp`;
      
      // Write to the temporary file first
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      
      // Rename the temporary file to the original file (atomic operation)
      fs.renameSync(tempPath, this.filePath);
      
      return true;
    } catch (error) {
      console.error(`Error writing data to ${this.filePath}:`, error);
      return false;
    }
  }

  /**
   * Check if the data file exists, create with default content if it doesn't
   */
  protected ensureFileExists(defaultContent: T): void {
    try {
      if (!fs.existsSync(this.filePath)) {
        // Create directory if it doesn't exist
        const dir = path.dirname(this.filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        // Create the file with default content
        fs.writeFileSync(this.filePath, JSON.stringify(defaultContent, null, 2), 'utf-8');
      }
    } catch (error) {
      console.error(`Error ensuring file exists at ${this.filePath}:`, error);
      throw new Error(`Failed to ensure file exists at ${this.filePath}`);
    }
  }
}
