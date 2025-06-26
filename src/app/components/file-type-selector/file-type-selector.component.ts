import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { ConfigService } from '../../services/config/config.service';

@Component({
  selector: 'app-file-type-selector',
  standalone: true,
  imports: [
    CommonModule,
    MatCheckboxModule,
    MatChipsModule,
    MatIconModule
  ],
  templateUrl: './file-type-selector.component.html',
  styleUrl: './file-type-selector.component.css'
})
export class FileTypeSelectorComponent {
  @Input() selectedFileTypes: string[] = [];
  @Output() selectedFileTypesChange = new EventEmitter<string[]>();

  availableFileTypes: string[] = [];

  /* ============================================================================================ */
  constructor(private configService: ConfigService) {
    this.availableFileTypes = this.configService.getCommonFileTypes();
  }

  /* ============================================================================================ */
  onFileTypeToggle(fileType: string, checked: boolean) {
    const newSelection = [...this.selectedFileTypes];

    if (checked && !newSelection.includes(fileType)) {
      newSelection.push(fileType);
    } else if (!checked) {
      const index = newSelection.indexOf(fileType);
      if (index > -1) {
        newSelection.splice(index, 1);
      }
    }

    this.selectedFileTypesChange.emit(newSelection);
  }
}
