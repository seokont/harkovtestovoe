export interface CommentNode {
  id: string
  text: string
  imagePath: string | null
  textFilePath: string | null
  parentId: string | null
  userId: string
  userName: string
  email: string
  homePage: string
  createdAt: string
  children: CommentNode[]
}

export interface EntryListResult {
  items: CommentNode[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CaptchaResponse {
  captchaId: string
  svg: string
}

export interface CreateEntryResponse {
  entry: CommentNode
  token: string
}
