import { environment } from "src/environments/environment"; 
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class DataService {

    constructor(private httpClient: HttpClient) { }

    //DEPRECATED
    data1: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 41, 444, 84, 84, 98, 94, 98,
        51, 54, 74, 6, 26, 86];
    data2: number[] = [0.1, 0.56895, 57, 0, 1, 13];
    data3: number[] = [85, 98, 85, 51, 46, 79, 88, 80,
        898, 84, 876, 16, 162, 158, 56,
        21, 5.551055648, 0.18550506, 0.54984322068, 4, 94, 484];

        
    fetchData(field: string): number[] {
        switch (field) {
            case 'champ1':
                return this.data1;
            case 'champ2':
                return this.data2;
            case 'champ3':
                return this.data3;
            default:
                return [];
        }
    }

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
