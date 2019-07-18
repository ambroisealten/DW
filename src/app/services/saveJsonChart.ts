import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SaveChart } from '../models/saveCharts';

@Injectable()
export class SaveJsonCharts {

    constructor(private httpClient: HttpClient) { }

    /**
     * Sauvegarde la configuration créée par l'utilisateur 
     */
    saveChartConfig(chartsSavedJson): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });

        return this.httpClient
        .post<SaveChart>(environment.baseUrl+ '/saveChartConfig/displayedName', chartsSavedJson,  {headers})
    }

    /**
     * Retrouve une configuration sauvegardée précédemment
     */
    getChartConfig(chartId: number, displayedName: string) {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });
        return this.httpClient.get(
            environment.baseUrl
            + '/getChartConfig/'
            + chartId
            + '/'
            + displayedName
            + '/'
            , { headers});
    }
}