export interface NotifyOptions {
    message: string;
    duration?: number;
}
/**
 * Programmatically show a top-centered notification.
 * This creates a one-off Vue app instance and unmounts it after closing.
 */
export declare function notify(options: NotifyOptions | string): void;
