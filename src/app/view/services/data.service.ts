import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class DataService {


    constructor(private httpClient: HttpClient) {}

    fetchData(tableName: string, columnName: string) {
        console.log('Oskour');
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
