import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebugActionsComponent } from './debug-actions.component';

describe('DebugActionsComponent', () => {
  let component: DebugActionsComponent;
  let fixture: ComponentFixture<DebugActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebugActionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DebugActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
