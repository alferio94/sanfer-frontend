import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventsOverviewComponent } from './events-overview.component';

describe('EventsOverviewComponent', () => {
  let component: EventsOverviewComponent;
  let fixture: ComponentFixture<EventsOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventsOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventsOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
