/** @type {import('./platform.mjs').PlatformConfig} */
export const platform = {
  id: 'juejin',
  placeholderPrefix: '__JUEJIN_IMG_',
  markersSchemaVersion: 'juejin-image-markers.v1',
  prepareUploadNote:
    'Preferred next step: node upload-imagex.mjs --upload-json <this-out> --out run.json --poll-out poll.json then page-agent-tool -f on the editor tab.',
  buildExecuteJavascriptHint(filename, mimeType, _base64) {
    return [
      'DEPRECATED: use upload-imagex.mjs instead of FormData placeholder.',
      `filename=${filename}`,
      `mimeType=${mimeType}`,
      'See domains/fix-juejin-article-images.md step 5.2',
    ].join(' ');
  },
};
