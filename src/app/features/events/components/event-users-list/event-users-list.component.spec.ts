import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventUsersListComponent } from './event-users-list.component';

describe('EventUsersListComponent', () => {
  let component: EventUsersListComponent;
  let fixture: ComponentFixture<EventUsersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventUsersListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventUsersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
