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
    builtinImportMap: import('@vue/reactivity').ComputedRef<import('@vue/repl').ImportMap>;
    vueVersion: import('@vue/reactivity').Ref<string | null, string | null>;
};
export {};
