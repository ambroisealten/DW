import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MatSelectionList, MatSelectionListChange, MatCheckbox } from '@angular/material';
import { AnimationStaggerMetadata } from '@angular/animations';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-modal-date-manipulation',
  templateUrl: './modal-date-manipulation.component.html',
  styleUrls: ['./modal-date-manipulation.component.scss']
})
export class ModalDateManipulationComponent implements OnInit {

  startDate: number;
  endDate: number;
  currentDate : string;


  @ViewChild('type', { static: true }) type: MatSelectionList;
  @ViewChild('compris', { static: true }) compris: MatCheckbox;

  constructor(private dialogRef: MatDialogRef<ModalDateManipulationComponent>,private toastr: ToastrService) { }

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
    this.toastr.success("Filtre ajouté avec succès", '' , {'positionClass': 'toast-bottom-full-width','closeButton':true});

  }

  myFilter() {
    this.startDate;
  }

  close() {
    this.dialogRef.close();
  }
}
