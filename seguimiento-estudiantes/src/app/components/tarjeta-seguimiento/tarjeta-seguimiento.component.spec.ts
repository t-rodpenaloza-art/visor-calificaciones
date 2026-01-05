import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TarjetaSeguimientoComponent } from './tarjeta-seguimiento.component';

describe('TarjetaSeguimientoComponent', () => {
  let component: TarjetaSeguimientoComponent;
  let fixture: ComponentFixture<TarjetaSeguimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TarjetaSeguimientoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TarjetaSeguimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
