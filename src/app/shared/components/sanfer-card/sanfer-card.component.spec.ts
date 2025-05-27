import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SanferCardComponent } from './sanfer-card.component';

describe('SanferCardComponent', () => {
  let component: SanferCardComponent;
  let fixture: ComponentFixture<SanferCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SanferCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SanferCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
