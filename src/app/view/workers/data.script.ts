

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
