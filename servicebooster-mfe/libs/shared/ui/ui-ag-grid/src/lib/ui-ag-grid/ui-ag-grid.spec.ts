import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiAgGrid } from './ui-ag-grid';

describe('UiAgGrid', () => {
  let component: UiAgGrid;
  let fixture: ComponentFixture<UiAgGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiAgGrid],
    }).compileComponents();

    fixture = TestBed.createComponent(UiAgGrid);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
