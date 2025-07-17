/**
 * 拖拽区域错误码
 */
export enum DragZoneErrorCode {
  /**
   * 文件类型不允许
   */
  FileTypeNotAllowed = 'file-type-not-allowed',
  /**
   * 文件大小超出限制
   */
  FileSizeExceeded = 'file-size-exceeded',
  /**
   * 文件数量超出限制
   */
  FileCountExceeded = 'file-count-exceeded',
}
