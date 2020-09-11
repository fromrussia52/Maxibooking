import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { Observable, interval, Subscription, timer } from 'rxjs';
import { ApiService } from './services/api.service';
import { ISource } from './source.interface';
import { debounce } from 'rxjs/operators';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('searchValueModel') searchValueModel: NgModel;

    sources: ISource[];
    currentExchange: number = null;
    private _subs: Subscription[] = [];
    private _timer$: Subscription = null;

    constructor(private apiService: ApiService) {
        this.sources = [{
            target: 'https://www.cbr-xml-daily.ru/daily_utf8.xml',
            name: 'daily_utf8.xml',
            state: 'active'
        }, {
            target: 'https://www.cbr-xml-daily.ru/daily_json.js',
            name: 'daily_json.js',
            state: null
        }]
    }

    ngAfterViewInit() {
        this._subs.push(this.searchValueModel.valueChanges.pipe(debounce(_ => interval(500))).subscribe(value => {
            if (!value || value.length === 0) {
                return;
            }

            this.sources.push({
                target: value,
                name: value,
                state: null
            });

            this.searchValueModel.control.setValue('', { emitEvent: false });
        }));

    }

    ngOnInit() {
        this.runTimer();
    }

    runTimer() {
        let queue = this.apiUrlGenerator();

        if (this._timer$) {
            this._timer$.unsubscribe();
        }

        this._timer$ = timer(0, 10000).subscribe(_ => {
            let source = queue.next();
            source && source.value && this.apiService.get(source.value.target).subscribe(data => {
                source.value.state = 'active';
                this.currentExchange = data;
            }, err => {
                source.value.state = 'failed';
            });
        });
        this._subs.push(this._timer$);
    }

    ngOnDestroy() {
        this._subs.forEach(s => {
            s.unsubscribe();
        });
    }

    private *apiUrlGenerator(): IterableIterator<ISource> {
        for (let i = 0; i < this.sources.length; i++) {
            yield this.sources[i];
            if (i === this.sources.length - 1) {
                i = -1;
            }
        }
    }
}
