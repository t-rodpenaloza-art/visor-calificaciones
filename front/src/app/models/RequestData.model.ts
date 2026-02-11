export interface RequestData {
    url: string;
    headers?: any;
    saveInCache?: boolean;
    responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
    isMock?: boolean;
    type?: 'get' | 'post';
    body?: any;
    tokenOrion?: 'Perfil' | 'Hijo';
    listSubSite?: IListSubsitio
}


export interface IListSubsitio {
    nameList: string;
    columns: string;
    type: 'sitio' | 'subsitio';
}