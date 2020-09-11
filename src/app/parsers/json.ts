import { IParser } from './parser';

export class JsonParser implements IParser {
    parse(data, sub) {
        if (data['Valute'] && data['Valute'].EUR) {
            sub.next(data['Valute'].EUR.Value);
        } else {
            sub.next(null);
        }
        sub.complete();
    }
}