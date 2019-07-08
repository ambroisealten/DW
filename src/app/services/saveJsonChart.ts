import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class SaveJsonCharts {

    constructor(private httpClient: HttpClient) { }

    fetchDataScheme(): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        })
        return this.httpClient.get()
    }


}