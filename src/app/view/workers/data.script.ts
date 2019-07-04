import { DataColumn } from '../models/DataColumn';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { InjectorInstance } from '../view.module';
import { environment } from 'src/environments/environment';

declare function postMessage(message: any): void;

export const DATA_IMPORT = (input) => {

    let httpClient = InjectorInstance.get<HttpClient>(HttpClient);

    // Process the body data
    const data = input.body;

    const dataColumn: DataColumn = new DataColumn(data.tableName, data.columnName, []);

    // IMPLEMENTS HTTP REST ROUTE
    // const headers = new HttpHeaders({
    //     'Content-Type': 'application/json',
    // });
    // httpClient.get(
    //     environment.baseUrl
    //     + '/data/'
    //     + data.tableName
    //     + '/'
    //     + data.columnName
    //     , { headers }).subscribe(dataFetched => {

    //     });

    // TO DELETE ON REST IMPLEMENTATION
    dataColumn.value = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // Call postMessage with the result data.
    postMessage(dataColumn);
};
