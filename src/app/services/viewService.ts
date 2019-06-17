import { Injectable } from '@angular/core';
import { DataSet } from '../models/dataSet';

@Injectable()
export class ViewService {

    private static instance1: ViewService = null;
    private static instance2: ViewService = null;
    private static instance3: ViewService = null;
    private static instance4: ViewService = null;

    type: string;
    dataSet: DataSet;
    options: string[];

    constructor() { }

    // Return the instance of the service
    public static getInstance(instanceNumber: number): ViewService {
        let instance: ViewService;
        switch (instanceNumber) {
            case 1:
                instance = this.instance1;
                break;
            case 2:
                instance = this.instance2;
                break;
            case 3:
                instance = this.instance3;
                break;
            case 4:
                instance = this.instance4;
                break;
            default:
                break;
        }
        if (instance === null) {
            instance = new ViewService();
        }
        return instance;
    }

}
