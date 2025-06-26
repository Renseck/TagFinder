import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CssExtensionSelectorComponent } from './css-extension-selector.component';

describe('CssExtensionSelectorComponent', () => {
  let component: CssExtensionSelectorComponent;
  let fixture: ComponentFixture<CssExtensionSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CssExtensionSelectorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CssExtensionSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
