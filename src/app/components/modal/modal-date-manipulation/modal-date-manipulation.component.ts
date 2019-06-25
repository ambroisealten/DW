import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MatSelectionList, MatSelectionListChange, MatCheckbox } from '@angular/material';

@Component({
  selector: 'app-modal-date-manipulation',
  templateUrl: './modal-date-manipulation.component.html',
  styleUrls: ['./modal-date-manipulation.component.scss']
})
export class ModalDateManipulationComponent implements OnInit {

  @ViewChild('type', { static: true }) type: MatSelectionList;
  @ViewChild('compris', { static: true }) compris: MatCheckbox;
  
  constructor(private dialogRef: MatDialogRef<ModalDateManipulationComponent>) { }

  ngOnInit() {
    this.type.selectionChange.subscribe((s: MatSelectionListChange) => {
      this.type.deselectAll();
      this.compris.checked = false;
      s.option.selected = true;
    });
  }

  unselectOther() {
    this.type.deselectAll();
  }

  save() {

  }
  
  close() {
    this.dialogRef.close();
  }
}
