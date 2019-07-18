import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class DataService {


    constructor(private httpClient: HttpClient) {}

    /**
     * Lance la récupération des données d'une colonne précise compris dans une table définie 
     * @param tableName 
     * @param columnName 
     */
    fetchData(tableName: string, columnName: string) {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });
        return this.httpClient.get(
            environment.baseUrl
            + '/data/'
            + tableName
            + '/'
            + columnName
            , { headers });
    }
}
