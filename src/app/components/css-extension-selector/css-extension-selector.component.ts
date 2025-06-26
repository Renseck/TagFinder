import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { ConfigService } from '../../services/config/config.service';

@Component({
  selector: 'app-css-extension-selector',
  standalone: true,
  imports: [
    CommonModule,
    MatCheckboxModule,
    MatIconModule
  ],
  templateUrl: './css-extension-selector.component.html',
  styleUrl: './css-extension-selector.component.css'
})
export class CssExtensionSelectorComponent {
  @Input() selectedCssExtensions: string[] = [];
  @Output() selectedCssExtensionsChange = new EventEmitter<string[]>();

  availableCssExtensions: string[] = [];

  /* ============================================================================================ */
  constructor(private configService: ConfigService) {
    this.availableCssExtensions = this.configService.getCommonCssTypes();
  }

  /* ============================================================================================ */
  onCssExtensionToggle(extension: string, checked: boolean) {
    const newSelection = [...this.selectedCssExtensions];
    
    if (checked && !newSelection.includes(extension)) {
      newSelection.push(extension);
    } else if (!checked) {
      const index = newSelection.indexOf(extension);
      if (index > -1) {
        newSelection.splice(index, 1);
      }
    }
    
    this.selectedCssExtensionsChange.emit(newSelection);
  }

  /* ============================================================================================ */
  getExtensionDescription(extension: string): string {
    const descriptions: { [key: string]: string } = {
      'css': 'Standard CSS',
      'scss': 'Sass (SCSS syntax)',
      'sass': 'Sass (indented syntax)',
      'less': 'Less CSS'
    };
    return descriptions[extension] || '';
  }
}
