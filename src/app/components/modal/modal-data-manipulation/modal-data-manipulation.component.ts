import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-data-manipulation',
  templateUrl: './modal-data-manipulation.component.html',
  styleUrls: ['./modal-data-manipulation.component.scss']
})
export class ModalDataManipulationComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<ModalDataManipulationComponent>,) { }

  ngOnInit() {
  }

}
