import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class LoadEcranService {

    constructor(private httpClient: HttpClient,
    ) { }

    loadEcran(id, displayedName) {
        return this.httpClient.get(environment.baseUrl + '/getChartConfig/' + id + '/' + displayedName);
    }
}