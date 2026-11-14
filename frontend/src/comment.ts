export interface CommentEntry {
  id: string
  userName?: string
  referenceId?: string | null
  text: string
  createdAt?: string
  date?: string
}
export interface CommentNode extends CommentEntry { children: CommentNode[] }
