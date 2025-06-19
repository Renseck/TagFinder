import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnusedReportComponent } from './unused-report.component';

describe('UnusedReportComponent', () => {
  let component: UnusedReportComponent;
  let fixture: ComponentFixture<UnusedReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnusedReportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UnusedReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
