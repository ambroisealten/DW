export class DataColumn {
    tableName: string;
    columnName: string;
    values: any[];
    constructor(tableName: string, columnName: string, values: any[]) {
        this.tableName = tableName;
        this.columnName = columnName;
        this.values = values;
    }
}
