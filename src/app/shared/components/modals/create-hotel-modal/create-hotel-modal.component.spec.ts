import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateHotelModalComponent } from './create-hotel-modal.component';

describe('CreateHotelModalComponent', () => {
  let component: CreateHotelModalComponent;
  let fixture: ComponentFixture<CreateHotelModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateHotelModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateHotelModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
