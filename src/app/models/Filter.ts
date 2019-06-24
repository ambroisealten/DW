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
    minDate: string ;
    maxDate: string ; 
    actif: boolean ; 
}