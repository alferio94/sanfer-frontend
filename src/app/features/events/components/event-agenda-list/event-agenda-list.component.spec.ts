import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventAgendaListComponent } from './event-agenda-list.component';

describe('EventAgendaListComponent', () => {
  let component: EventAgendaListComponent;
  let fixture: ComponentFixture<EventAgendaListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventAgendaListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventAgendaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
