import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalLoadSpinnerComponent } from './modal-load-spinner.component';

describe('ModalLoadSpinnerComponent', () => {
  let component: ModalLoadSpinnerComponent;
  let fixture: ComponentFixture<ModalLoadSpinnerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalLoadSpinnerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalLoadSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
