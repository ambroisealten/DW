import { environment } from "src/environments/environment"; 
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class DataService {

    constructor(private httpClient: HttpClient) { }

    fetchDataScheme() {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });

        return this.httpClient.get<string>(environment.baseUrl + '/dataScheme', { headers });
    }

    getData() {
        return this.httpClient.get('assets/data_count_study.json')
    }

}
