import { FilterList } from './Filter';


export class saveChart {
    type: string;
    table: saveChartTable;
    filters: FilterList;
}

export class saveChartTable {
    name: string;
    column: string[];
}