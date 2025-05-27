import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendaTimelineComponent } from './agenda-timeline.component';

describe('AgendaTimelineComponent', () => {
  let component: AgendaTimelineComponent;
  let fixture: ComponentFixture<AgendaTimelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgendaTimelineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgendaTimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
