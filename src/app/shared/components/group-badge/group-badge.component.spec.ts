import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupBadgeComponent } from './group-badge.component';

describe('GroupBadgeComponent', () => {
  let component: GroupBadgeComponent;
  let fixture: ComponentFixture<GroupBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupBadgeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
