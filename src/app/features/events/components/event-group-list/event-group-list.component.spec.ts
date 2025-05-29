import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventGroupListComponent } from './event-group-list.component';

describe('EventGroupListComponent', () => {
  let component: EventGroupListComponent;
  let fixture: ComponentFixture<EventGroupListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventGroupListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventGroupListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
