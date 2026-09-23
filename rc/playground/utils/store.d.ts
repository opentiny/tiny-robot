import { File } from '@vue/repl';
interface GenerateStoreOptions {
    tinyRobotVersion?: string;
    vueVersion?: string;
    files?: (File | {
        filename: string;
        code: string;
    })[];
    extraImports?: Record<string, string>;
}
export declare const generateStore: (options: GenerateStoreOptions) => {
    store: import('@vue/repl').ReplStore;
    builtinImportMap: import('vue').ComputedRef<import('@vue/repl').ImportMap>;
    vueVersion: import('vue').Ref<string | null, string | null>;
};
export {};
