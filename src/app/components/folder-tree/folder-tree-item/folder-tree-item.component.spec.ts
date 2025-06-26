import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FolderTreeItemComponent } from './folder-tree-item.component';

describe('FolderTreeItemComponent', () => {
  let component: FolderTreeItemComponent;
  let fixture: ComponentFixture<FolderTreeItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FolderTreeItemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FolderTreeItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
