import { ImportMap } from '@vue/repl';
interface ImportMapOptions {
    tinyRobotVersion: string;
    builtinImportMap?: ImportMap;
    extraImports?: Record<string, string>;
}
export declare function generateImportMap(options: ImportMapOptions): ImportMap;
export {};
