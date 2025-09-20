import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TouristSpotsComponent } from './tourist-spots.component';

describe('TouristSpotsComponent', () => {
  let component: TouristSpotsComponent;
  let fixture: ComponentFixture<TouristSpotsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TouristSpotsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TouristSpotsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
