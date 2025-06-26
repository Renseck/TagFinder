import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileTypeSelectorComponent } from './file-type-selector.component';

describe('FileTypeSelectorComponent', () => {
  let component: FileTypeSelectorComponent;
  let fixture: ComponentFixture<FileTypeSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileTypeSelectorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FileTypeSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
