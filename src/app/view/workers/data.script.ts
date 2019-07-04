

declare function postMessage(message: any): void;


export const DATA_IMPORT = (input) => {

    // const httpClient = InjectorInstance.get<HttpClient>(HttpClient);
    
    // Process the body data
    const data = input.body;
    
    const tableName = data.tableName;
    const columnName = data.columnName;

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
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // Call postMessage with the result data.
    postMessage({ tableName, columnName, values });
};
