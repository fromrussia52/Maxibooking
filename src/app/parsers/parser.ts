import { Subscriber } from 'rxjs';

export interface IParser {
    parse(data: string, sub: Subscriber<any>);
}