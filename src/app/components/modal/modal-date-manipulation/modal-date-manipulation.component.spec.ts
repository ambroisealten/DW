import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDateManipulationComponent } from './modal-date-manipulation.component';

describe('ModalDateManipulationComponent', () => {
  let component: ModalDateManipulationComponent;
  let fixture: ComponentFixture<ModalDateManipulationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalDateManipulationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalDateManipulationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
