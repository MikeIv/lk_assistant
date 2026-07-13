export interface NegotiationStatus {
  id: number
  status: string
  name: string
  created_by_id: number | null
  responsible: string | null
  created_at: string
}

export interface NegotiationStatusApiResource {
  id: number
  status: string
  name: string
  created_by_id: number | null
  responsible?: string | null
  created_at: string
}

export interface NegotiationStatusesListApiResponse {
  success: boolean
  message: string
  payload: {
    items: NegotiationStatusApiResource[]
  }
}
