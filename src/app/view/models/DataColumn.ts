export class DataColumn {
    tableName: string;
    columnName: string;
    value: any[];
    constructor(tableName: string, columnName: string, value: any[]) {
        this.tableName = tableName;
        this.columnName = columnName;
        this.value = value;
    }

}
