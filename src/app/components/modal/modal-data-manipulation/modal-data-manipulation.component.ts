import { Component, OnInit, Inject, Output, EventEmitter, ViewChild, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectionList, MatSelectionListChange, MatCheckbox, MatRadioGroup } from '@angular/material';
import { Filter } from 'src/app/models/Filter';
import { ToastrService } from 'ngx-toastr';

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

  constructor(private dialogRef: MatDialogRef<ModalDataManipulationComponent>, @Inject(MAT_DIALOG_DATA) public data, private toastr: ToastrService) {
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
      if (!this.isTri && this.isFiltered(this.valueSolo, newFilter['type'])) {
        return;
      }
      newFilter['min'] = this.valueSolo;
      newFilter['name'] = this.createName(newFilter['type'], newFilter['min']);
    } else if (this.compris.checked && this.valueMin != undefined && this.valueMax != undefined) {
      newFilter['type'] = 'compris';
      if (!this.isTri && (this.isFiltered(this.valueMin, newFilter['type']) || this.isFiltered(this.valueMax, newFilter['type']))) {
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
    this.toastr.success("Filtre ajouté avec succès", '' , {'positionClass': 'toast-bottom-full-width','closeButton':true});
  }

  close() {
    this.dialogRef.close();
  }

  isFiltered(value, type) {
    let bool: boolean = false;
    this.filters.forEach(filter => {
      if (filter.actif) {
        if (!bool) {
          switch (filter.type) {
            case ('inf. à'):
              bool = (value < filter.min);
              break;
            case ('inf. égal à'):
              bool = (value <= filter.min);
              break;
            case ('égal'):
              bool = (value == filter.min);
              break;
            case ('sup. à'):
              bool = (value > filter.min);
              break;
            case ('sup. égal à'):
              bool = (value > filter.min);
              break;
            case ('compris'):
              bool = ((value >= filter.min) && (value <= filter.max));
              break;
          }
        } else {
          return;
        }
        if (!bool) {
          switch (type) {
            case ('inf. à'):
              bool = (value > filter.min);
              break;
            case ('inf. égal à'):
              bool = (value >= filter.min);
              break;
            case ('égal'):
              bool = (value == filter.min);
              break;
            case ('sup. à'):
              bool = (filter.min > value);
              break;
            case ('sup. égal à'):
              bool = (filter.min >= value);
              break;
          }
        } else {
          return;
        }
      }
    })
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
