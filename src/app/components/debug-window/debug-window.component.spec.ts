import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebugWindowComponent } from './debug-window.component';

describe('DebugWindowComponent', () => {
  let component: DebugWindowComponent;
  let fixture: ComponentFixture<DebugWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebugWindowComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DebugWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
