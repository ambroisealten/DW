import { FilterList } from './Filter';


export class SaveChart {
    type: string;
    table: SaveChartTable;
    filters: FilterList;
    display: string;
}

export class SaveChartTable {
    name: string;
    column: string[];
}

export class ChartsScreen{
    charts: SaveChart[];
}