import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class LoadEcranService {

    constructor(private httpClient: HttpClient,
    ) { }

    /**
     * Charge une configuration d'écran en fonction de son nom et de son id
     * @param id 
     * @param displayedName 
     */
    loadEcran(id, displayedName) {
        return this.httpClient.get(environment.baseUrl + '/getChartConfig/' + id + '/' + displayedName);
    }
}