import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LoggingService } from '../logging/logging.service';

@Injectable({
  providedIn: 'root'
})
export class DirectoryService {
  private selectedDirectorySubject = new BehaviorSubject<string>('');
  public selectedDirectory$ = this.selectedDirectorySubject.asObservable();

  /* ============================================================================================ */
  constructor(private logger: LoggingService) {}

  /* ============================================================================================ */
  getCurrentDirectory(): string {
    return this.selectedDirectorySubject.value;
  }

  /* ============================================================================================ */
  setSelectedDirectory(directory: string): void {
    const previousDirectory = this.selectedDirectorySubject.value;
    
    if (previousDirectory !== directory) {
      this.selectedDirectorySubject.next(directory);
      this.logger.info('DIRECTORY_SERVICE', `Directory changed from "${previousDirectory}" to "${directory}"`);
    }
  }

  /* ============================================================================================ */
  clearSelectedDirectory(): void {
    this.setSelectedDirectory('');
  }
}
