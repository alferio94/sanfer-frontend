import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventSurveysListComponent } from './event-surveys-list.component';

describe('EventSurveysListComponent', () => {
  let component: EventSurveysListComponent;
  let fixture: ComponentFixture<EventSurveysListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventSurveysListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventSurveysListComponent);
    component = fixture.componentInstance;
    component.eventId = 'test-event-id';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});