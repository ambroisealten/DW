export class FilterList
{
    filterColumn: string ; 
    filterType: string ;
    excludeValue: string[] ; 
    filters: Filter[] ;
}

export class Filter{
    min: number ;
    max: number ; 
    type: string ; 
    listElem: string[] ;
    minDate: string ;
    maxDate: string ; 
    actif: boolean ; 
}