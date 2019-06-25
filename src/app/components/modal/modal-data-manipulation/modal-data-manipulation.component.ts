import { Component, OnInit, Inject, Output, EventEmitter, ViewChild, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectionList, MatSelectionListChange, MatCheckbox, MatRadioGroup } from '@angular/material';
import { Filter } from 'src/app/models/Filter';

@Component({
  selector: 'app-modal-data-manipulation',
  templateUrl: './modal-data-manipulation.component.html',
  styleUrls: ['./modal-data-manipulation.component.scss']
})
export class ModalDataManipulationComponent implements OnInit {

  @Output() public addFilter: EventEmitter<any> = new EventEmitter<any>();
  isTri: boolean;
  filters: Filter[];

  @ViewChild('type', { static: true }) type: MatSelectionList;
  @ViewChild('compris', { static: true }) compris: MatCheckbox;
  excludeOption: string;

  valueSolo;
  valueMin;
  valueMax;

  constructor(private dialogRef: MatDialogRef<ModalDataManipulationComponent>, @Inject(MAT_DIALOG_DATA) public data) {
    this.isTri = data.bool;
    this.filters = data.filters
  }

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

  onSave() {
    let newFilter: Filter = new Filter();
    if (this.type.selectedOptions.selected.length > 0 && this.valueSolo != undefined) {
      newFilter['type'] = this.type.selectedOptions.selected[0].value;
      if (!this.isTri && this.isFiltered(this.valueSolo, null, newFilter['type'])) {
        return;
      }
      newFilter['min'] = this.valueSolo;
      newFilter['name'] = this.createName(newFilter['type'], newFilter['min']);
    } else if (this.compris.checked && this.valueMin != undefined && this.valueMax != undefined) {
      newFilter['type'] = 'compris';
      if (!this.isTri && this.isFiltered(this.valueMin,this.valueMax, newFilter['type'])) {
        return;
      }
      newFilter['min'] = this.valueMin;
      newFilter['max'] = this.valueMax;
      newFilter['name'] = '[' + this.valueMin + ',' + this.valueMax + ']';
    } else {
      return;
    }
    if (this.isTri) {
      if (this.excludeOption == undefined) {
        return;
      }
      newFilter['excludeValue'] = this.excludeOption;
    }
    newFilter['actif'] = true;
    this.addFilter.emit(newFilter);
  }

  close() {
    this.dialogRef.close();
  }

  isFiltered(valueMin, valueMax, type) {
    let bool: boolean = false;
    for(let i = 0 ; i < this.filters.length ; i++){
      if(valueMax == null){
        bool = (this.filters[i].min == valueMin) && (type == this.filters[i].type)
      } else {
        bool = (this.filters[i].min == valueMin) && (type == this.filters[i].type) && (this.filters[i].max == valueMax)
      }
      if(bool){
        return bool ; 
      }
      if (this.filters[i].actif) {
        if (!bool) {
          switch (this.filters[i].type) {
            case ('inf. à'):
              if(type == 'inf. à' || type == 'inf. égal à'){
                bool = valueMin <= this.filters[i].min
              } else {
                bool = (valueMin < this.filters[i].min);
              }
              break;
            case ('inf. égal à'):
              bool = (valueMin <= this.filters[i].min);
              break;
            case ('sup. à'):
              if(type == 'sup. à' || type == 'sup. égal à'){
                bool = valueMin >= this.filters[i].min
              } else {
                bool = (valueMin > this.filters[i].min);
              }
              break;
            case ('sup. égal à'):
              bool = (valueMin > this.filters[i].min);
              break;
            case ('compris'):
              if (type == 'compris') {
                bool = (((valueMin >= this.filters[i].min) && (valueMin <= this.filters[i].max)) || ((valueMax >= this.filters[i].min) && (valueMax <= this.filters[i].max)));
              } else if (type == 'inf. à'){
                bool = valueMin > this.filters[i].min;
              } else if (type == 'inf. égal à'){
                bool = valueMin >= this.filters[i].min;
              } else if (type == 'sup. égal à'){
                bool = valueMin <= this.filters[i].max;
              } else if (type == 'sup. à') {
                bool = valueMin < this.filters[i].max;
              } else {
                bool = (valueMin >= this.filters[i].min) && (valueMin <= this.filters[i].max)
              }
              break;
          }
        }
        if (!bool) {
          switch (type) {
            case ('inf. à'):
              bool = (valueMin > this.filters[i].min);
              break;
            case ('inf. égal à'):
              bool = (valueMin >= this.filters[i].min);
              break;
            case ('sup. à'):
              bool = (this.filters[i].min > valueMin);
              break;
            case ('sup. égal à'):
              bool = (this.filters[i].min >= valueMin);
              break;
            case ('compris'):
              if (this.filters[i].type == 'compris') {
                bool = (((valueMin <= this.filters[i].min) && (valueMax >= this.filters[i].min)) || ((valueMin <= this.filters[i].max) && (valueMax >= this.filters[i].max)));
              }  else if (type == 'inf. à'){
                bool = valueMin < this.filters[i].min;
              } else if (type == 'inf. égal à'){
                bool = valueMin <= this.filters[i].min;
              } else if (type == 'sup. égal à'){
                bool = valueMin >= this.filters[i].min;
              } else if (type == 'sup. à') {
                bool = valueMin > this.filters[i].min;
              } else {
                bool = (valueMin <= this.filters[i].min) && (valueMax >= this.filters[i].min)
              }
              break;
          }
          if(bool){
            return bool; 
          }
        }
      }
    }
    return bool;
  }

  createName(type, valueMin): string {
    let name = "";
    switch (type) {
      case ('inf. à'):
        name = "< " + valueMin;
        break;
      case ('inf. égal à'):
        name = "<= " + valueMin;
        break;
      case ('égal'):
        name = valueMin;
        break;
      case ('sup. à'):
        name = "> " + valueMin;
        break;
      case ('sup. égal à'):
        name = ">= " + valueMin;
        break;
    }
    return name;
  }
}
