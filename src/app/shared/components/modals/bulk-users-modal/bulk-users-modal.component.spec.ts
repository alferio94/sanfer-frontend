import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkUsersModalComponent } from './bulk-users-modal.component';

describe('BulkUsersModalComponent', () => {
  let component: BulkUsersModalComponent;
  let fixture: ComponentFixture<BulkUsersModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkUsersModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BulkUsersModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
