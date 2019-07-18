import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class DataService {

    constructor(private httpClient: HttpClient) { }

    /**
     * Lance la récupération du schéma de données 
     */
    fetchDataScheme(): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });
        return this.httpClient.get<string>(environment.baseUrl + '/dataScheme', { headers });
    }

    /**
     * Lance la récupération d'une table particulière, en fonction d'une ligne de début et d'une ligne de fin
     * @param tableName 
     * @param start 
     * @param end 
     */
    getData(tableName: string, start: number, end: number) {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });
        return this.httpClient.get(
            environment.baseUrl
            + '/data/'
            + tableName
            + '/'
            + start
            + '/'
            + end
            , { headers });
    }

    /**
     * Retrouve une configuration sauvegardée précédemment
     * @param id 
     */
    getConfiguration(id: number) {
        return this.httpClient.get(environment.baseUrl + '/getChartConfig/' + id + '/displayedName');
    }
}
