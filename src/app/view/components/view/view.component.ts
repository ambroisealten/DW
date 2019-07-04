import { Component, OnInit, ViewChildren, ViewContainerRef, QueryList, ComponentFactoryResolver } from '@angular/core';
import { LoadEcranService } from '../../services/load-ecran.service';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit {

  allTemplates = 0 ; 

  //Liste des entries pour les templates
  @ViewChildren('chartHost', { read: ViewContainerRef }) entries: QueryList<ViewContainerRef>;

  constructor(private loadEcranService: LoadEcranService,
    private componentFactoryResolver: ComponentFactoryResolver,
    ) { }

  ngOnInit() {
    this.loadEcranService.loadEcran().subscribe((data: any[]) => 
      {
        this.allTemplates = data.length ; 
      }) ; 
  }

}
