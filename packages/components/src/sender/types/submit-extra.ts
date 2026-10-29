export interface SenderExternalPayload {
  readonly source: string
  readonly payload: unknown
}

export interface SenderSubmitExtra {
  externalPayloads: SenderExternalPayload[]
}
