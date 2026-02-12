import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntegralDashboardComponent } from './integral-dashboard.component';

describe('IntegralDashboardComponent', () => {
  let component: IntegralDashboardComponent;
  let fixture: ComponentFixture<IntegralDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntegralDashboardComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(IntegralDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
