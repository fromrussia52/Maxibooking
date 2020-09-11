import { Parser } from 'xml2js';
import { IParser } from './parser';

export class XmlParser implements IParser {
    parse(data, sub) {
        let parser = new Parser();
        parser.parseStringPromise(data)
            .then(res => {
                if (res['ValCurs'] && res['ValCurs'].Valute) {
                    let finded = (res['ValCurs']['Valute'] as Array<any>).find(el => {
                        if ((el.CharCode as Array<any>).includes('EUR')) {
                            return true;
                        }
                    });
                    if (finded) {
                        sub.next(finded.Value[0]);
                    }
                } else {
                    sub.next(null);
                }
                sub.complete();
            })
            .catch(err => sub.error(err))
    }
}