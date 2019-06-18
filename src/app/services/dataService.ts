import { environment } from 'src/environments/environment.prod';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class DataService {

    constructor(private httpClient: HttpClient) { }

    //DEPRECATED
    data1: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 94, 444984, 84, 984, 984, 984, 984,
        98451, 54, 874, 6, 256, 84];
    data2: number[] = [0.1, 0.56895, 0.8976, 0.2357, 2357, 0, 1, 15563];
    data3: number[] = [89875, 98, 857574, 514877, 48466, 79, 89484, 8457984,
        898541654785, 884154, 8849876, 1123123156, 166642, 15861321, 56632456,
        241652451, 5510.551055648, 0.18550506, 0.54984322068, 84984, 9984654, 484];
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

}
