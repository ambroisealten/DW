export class FilterList
{
    filterColumn: string ; 
    filterType: string ;
    excludeValue: string[] ; 
    filters: Filter[] ;
}

export class Filter{
    name: string;
    min: number ;
    max: number ; 
    type: string ; 
    listElem: string[] ;
    startDate: number ;
    endDate: number ; 
    actif: boolean ; 
}