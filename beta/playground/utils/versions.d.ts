interface GetVersionsOptions {
    includePrerelease?: boolean | string[];
    limit?: number;
    includeLatest?: boolean;
}
export declare function getVersions(pkg: string, options?: GetVersionsOptions): Promise<string[]>;
export {};
