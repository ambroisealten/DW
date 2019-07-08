

declare function postMessage(message: any): void;


export const DATA_IMPORT = (input) => {

    // Process the body data
    const data = input.body;
    const context = data.context;

    const tableName = data.tableName;
    const columnName = data.columnName;
    const values = [];
    console.log(context);
    postMessage({ tableName, columnName, values });
};

export const DATA_CALC_FREQUENCIES = (input) => {

    // Process the body data
    const data = input.body.values as any[];

    const freqs = { values: {}, sum: 0 };
    data.map(a => {
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
