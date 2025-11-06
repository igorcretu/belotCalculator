export interface AppSettings {
    showThirdColumn: boolean;
    fontSize: string;
}

export interface Game {
    id: number;
    date: string;
    rows: Row[];
    noiHeader: string;
    voiHeader: string;
    thirdHeader?: string;
    showThirdColumn: boolean;
    totalNoi: number;
    totalVoi: number;
    totalThird?: number;
}

export default interface Row {
    row_id: number;
    noi: number;
    voi: number;
    noiOld?: number;
    voiOld?: number;
    thirdColumng?: number;
    thirdColumnOld?: number;
    turn?: string;

}