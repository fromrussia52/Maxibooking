import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, switchMap, switchMapTo } from 'rxjs/operators';
import { JsonParser } from '../parsers/json';
import { XmlParser } from '../parsers/xml';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private _allowedFormats = ['js', 'xml'];

    constructor(
        private http: HttpClient
    ) { }

    get(apiUrl: string): Observable<any> {
        if (!apiUrl) {
            return throwError('Parameter apiUrl is not defined');
        }

        let format = apiUrl.split('.').pop();

        if (!this._allowedFormats.includes(format)) {
            alert(`Формат ${format} не поддерживается.\nРазрешенные форматы: ${this._allowedFormats.join(', ')}`);
            return;
        }

        let headers = new HttpHeaders();
        if (format === 'xml') {
            headers.set('Accept', 'text/xml');
            headers.set('Content-Type', 'text/xml');
        }
        let responseType: any = format !== 'js' ? 'text' : 'json';

        return this.http.get(apiUrl, {
            headers: headers,
            observe: 'body',
            responseType: responseType
        }).pipe(switchMap(data => {
            let obs: Observable<any> = new Observable(sub => {
                if (format === 'xml') {
                    (new XmlParser()).parse(data, sub);
                } else {
                    (new JsonParser()).parse(data, sub);
                }
            });
            return obs;
        }));
    }
}
