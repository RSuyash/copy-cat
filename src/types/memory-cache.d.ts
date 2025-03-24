declare module 'memory-cache' {
    export function put(key: string, value: any, duration?: number): void;
    export function get(key: string): any;
    export function del(key: string): void;
    export function clear(): void;
    export default {
        put,
        get,
        del,
        clear
    };
}
