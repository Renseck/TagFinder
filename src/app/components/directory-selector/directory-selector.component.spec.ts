import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectorySelectorComponent } from './directory-selector.component';

describe('DirectorySelectorComponent', () => {
  let component: DirectorySelectorComponent;
  let fixture: ComponentFixture<DirectorySelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectorySelectorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DirectorySelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
