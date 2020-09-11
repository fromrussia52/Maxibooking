export interface ISource {
    target: string;
    name?: string;
    state?: 'active' | 'failed';
}