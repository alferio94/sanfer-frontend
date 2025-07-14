import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventHotelListComponent } from './event-hotel-list.component';

describe('EventHotelListComponent', () => {
  let component: EventHotelListComponent;
  let fixture: ComponentFixture<EventHotelListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventHotelListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventHotelListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
