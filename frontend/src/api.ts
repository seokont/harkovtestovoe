import axios from 'axios'
import type {
  CaptchaResponse,
  CreateEntryResponse,
  EntryListResult,
} from './comment'

export const API_BASE = 'http://localhost:3000'

export interface EntryQuery {
  sortBy?: string
  order?: string
  page?: number
  limit?: number
}

export interface CreateEntryPayload {
  userName: string
  email: string
  homePage?: string
  captchaId: string
  captchaAnswer: string
  text: string
  parentId?: string
  imagePath?: string
  textFilePath?: string
}

export async function getCaptcha(): Promise<CaptchaResponse> {
  const { data } = await axios.get<CaptchaResponse>(`${API_BASE}/captcha`)
  return data
}

export async function getEntries(query: EntryQuery): Promise<EntryListResult> {
  const { data } = await axios.get<EntryListResult>(`${API_BASE}/entries`, {
    params: query,
  })
  return data
}

export async function createEntry(
  payload: CreateEntryPayload,
): Promise<CreateEntryResponse> {
  const { data } = await axios.post<CreateEntryResponse>(
    `${API_BASE}/entries`,
    payload,
  )
  return data
}

export async function uploadImage(file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await axios.post<{ url: string }>(
    `${API_BASE}/uploads/image`,
    form,
  )
  return data.url
}

export async function uploadText(file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await axios.post<{ url: string }>(
    `${API_BASE}/uploads/text`,
    form,
  )
  return data.url
}

export async function deleteEntry(id: string, token: string): Promise<void> {
  await axios.delete(`${API_BASE}/entries/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}
