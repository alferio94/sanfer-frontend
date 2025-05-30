import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAgendaModalComponent } from './create-agenda-modal.component';

describe('CreateAgendaModalComponent', () => {
  let component: CreateAgendaModalComponent;
  let fixture: ComponentFixture<CreateAgendaModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateAgendaModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateAgendaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
