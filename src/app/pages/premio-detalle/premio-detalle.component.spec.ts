import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PremioDetalleComponent } from './premio-detalle.component';

describe('PremioDetalleComponent', () => {
  let component: PremioDetalleComponent;
  let fixture: ComponentFixture<PremioDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PremioDetalleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PremioDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
