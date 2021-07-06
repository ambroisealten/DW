import { DataColumn } from '../models/DataColumn';


declare function postMessage(message: any): void;


export const DATA_IMPORT = (input) => {

    // Process the body data
    const data = input.body;
    const context = data.context;

    const tableName = data.tableName;
    const columnName = data.columnName;
    const values = [];
    postMessage({ tableName, columnName, values });
};

export const DATA_CALC_FREQUENCIES = (input) => {
    // Process the body data
    const data = input.body.values as any[];
    const freqs = { values: {}, sum: 0 };
    data.map(function (a) {
        if (!(a in this.values)) {
            this.values[a] = 1;
        } else {
            this.values[a] += 1;
        }
        this.sum += 1;
        return a;
    }, freqs
    );
    postMessage(freqs);
};

export const DATA_CALC_X_Y_COORDINATES = (input) => {

    // Process the body data
    const x = input.body.values.x as any[];
    const y = input.body.values.y as any[];

    const values = [];
    if (x.length === y.length) {
        for (let index = 0; index < x.length; index++) {
            values.push({ x: x[index], y: y[index] });
        }
    }
    postMessage(values);
};

export const DATA_TRANSFORM_TO_OBJECT = (input) => {
    // Process the body data
    const data = input.body.data as DataColumn[];
    const table = input.body.table as string;
    let values = [];
    const tableData = data.filter(dataColumn => dataColumn.tableName === table);
    values.length = tableData[0].values.length;
    values = values.fill('{', 0, -2);
    // tslint:disable-next-line: prefer-for-of
    for (let j = 0; j < tableData.length; j++) {
        const column = tableData[j];
        for (let i = 0; i < values.length; i++) {
            const value = column.values[i] === undefined ? '"' + column.values[i] + '"' : JSON.stringify(column.values[i]);
            // tslint:disable-next-line: forin
            const json = '"' + column.columnName + '":' + value + ',';
            values[i] += json;
        }
    }
    // tslint:disable-next-line: prefer-for-of
    for (let index = 0; index < values.length; index++) {
        values[index] += '}';
        values[index] = JSON.parse(values[index].replace(',}', '}').replace('undefined"', '{"'));
    }

    postMessage(values);
};
