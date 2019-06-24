import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalStringManipulationComponent } from './modal-string-manipulation.component';

describe('ModalStringManipulationComponent', () => {
  let component: ModalStringManipulationComponent;
  let fixture: ComponentFixture<ModalStringManipulationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalStringManipulationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalStringManipulationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
