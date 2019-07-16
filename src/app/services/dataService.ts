import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class DataService {

    constructor(private httpClient: HttpClient) { }

    fetchDataScheme(): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });
        return this.httpClient.get<string>(environment.baseUrl + '/dataScheme', { headers });
    }

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

    getConfiguration(id: number) {
        return this.httpClient.get(environment.baseUrl + '/getChartConfig/' + id + '/displayedName');
    }
}
