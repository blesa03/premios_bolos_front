import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SugerirPremioComponent } from './sugerir-premio.component';

describe('SugerirPremioComponent', () => {
  let component: SugerirPremioComponent;
  let fixture: ComponentFixture<SugerirPremioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SugerirPremioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SugerirPremioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
