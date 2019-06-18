import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDataManipulationComponent } from './modal-data-manipulation.component';

describe('ModalDataManipulationComponent', () => {
  let component: ModalDataManipulationComponent;
  let fixture: ComponentFixture<ModalDataManipulationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalDataManipulationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalDataManipulationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
