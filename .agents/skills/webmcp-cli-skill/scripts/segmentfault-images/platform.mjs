export const platform = {
  id: 'segmentfault',
  placeholderPrefix: '__SEGMENTFAULT_IMG_',
  markersSchemaVersion: 'segmentfault-image-markers.v1',
  prepareUploadNote:
    'Preferred next step: node upload-editor.mjs --upload-json <this-out> --out run.json --poll-out poll.json then page-agent-tool -f on https://segmentfault.com/write.',
  buildExecuteJavascriptHint(filename, mimeType, _base64) {
    return [
      'Use upload-editor.mjs on segmentfault.com/write tab.',
      `filename=${filename}`,
      `mimeType=${mimeType}`,
      'See domains/fix-segmentfault-article-images.md step 5',
    ].join(' ');
  },
};
