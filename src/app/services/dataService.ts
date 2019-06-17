import { DataScheme } from '../models/dataScheme';

export class DataService {
    jsonData = '{"datas" : [{ "name": "nomTable1", "fields":[ "champ1", "champ2", "champ3" ]},{ "name": "nomTable2", "fields":[ "champ1", "champ2", "champ3", "champ4" ]},{ "name": "nomTable1", "fields":[ "champ1", "champ2" ]} ] }';

    fetchDataScheme() {
        const datas: DataScheme[] = [];
        const datasFetched = JSON.parse(this.jsonData)['datas'];
        datasFetched.forEach(element => {
            datas.push(element as DataScheme);
        });
        return datas;
    }

}
