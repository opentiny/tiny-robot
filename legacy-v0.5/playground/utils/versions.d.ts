interface GetVersionsOptions {
    includePrerelease?: boolean | string[];
    limit?: number;
    includeLatest?: boolean;
}
type VersionsResult = {
    versions: string[];
    lastVersion: string | undefined;
};
export declare function getVersions(pkg: string, options?: GetVersionsOptions): Promise<VersionsResult>;
export {};
