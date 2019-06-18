
export class DataSet {
    name: string;
    values: number[];

    constructor(name?: string,values?:number[]){
        this.name = name;
        this.values = values;
    }

    public static empty() {
        return new DataSet();
    }

}
