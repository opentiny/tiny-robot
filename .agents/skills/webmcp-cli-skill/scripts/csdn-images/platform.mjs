/** @typedef {{ id: string, placeholderPrefix: string, markersSchemaVersion: string, prepareUploadNote: string, buildExecuteJavascriptHint?: (filename: string, mimeType: string, base64: string) => string }} PlatformConfig */

/** @type {PlatformConfig} */
export const platform = {
  id: 'csdn',
  placeholderPrefix: '__CSDN_IMG_',
  markersSchemaVersion: 'csdn-image-markers.v1',
  prepareUploadNote:
    'Next: node upload-editor.mjs --upload-json <this-out> --out run.json --poll-out poll.json, then page-agent-tool -f on CSDN editor tab. Or use editor UI image upload with local_path.',
};
