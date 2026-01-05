import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscadorEstudiantesComponent } from './buscador-estudiantes.component';

describe('BuscadorEstudiantesComponent', () => {
  let component: BuscadorEstudiantesComponent;
  let fixture: ComponentFixture<BuscadorEstudiantesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuscadorEstudiantesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuscadorEstudiantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
