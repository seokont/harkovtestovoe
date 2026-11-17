<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CommentNode } from '../../comment'
import { API_BASE, deleteEntry } from '../../api'
import { sanitizeCommentHtml } from '../../sanitize'
import Lightbox from '../Lightbox/index.vue'

defineOptions({ name: 'CommentItem' })

const props = defineProps<{ comment: CommentNode; myUserId?: string | null }>()
const emit = defineEmits<{ reply: [node: CommentNode]; deleted: [] }>()

const lightboxSrc = ref<string | null>(null)
const deleting = ref(false)

const date = computed(() => {
  const v = props.comment.createdAt
  if (!v) return ''
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
    .format(d)
    .replace(', ', ' в ')
})

const safeText = computed(() => sanitizeCommentHtml(props.comment.text))
const isOwn = computed(
  () => !!props.myUserId && props.comment.userId === props.myUserId,
)

const imageSrc = computed(() => {
  const p = props.comment.imagePath
  if (!p) return null
  return p.startsWith('http') ? p : `${API_BASE}${p}`
})

const fileHref = computed(() => {
  const p = props.comment.textFilePath
  if (!p) return null
  return p.startsWith('http') ? p : `${API_BASE}${p}`
})

async function onDelete() {
  if (deleting.value) return
  const token = localStorage.getItem('token')
  if (!token) return
  if (!window.confirm('Удалить комментарий?')) return
  deleting.value = true
  try {
    await deleteEntry(props.comment.id, token)
    emit('deleted')
  } catch {
    window.alert('Не удалось удалить комментарий')
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <article :id="`comment-${comment.id}`" class="comment">
    <header class="comment-header">
      <span class="avatar" aria-hidden="true">{{ comment.userName.slice(0, 1).toUpperCase() }}</span>
      <div class="meta">
        <span class="author">{{ comment.userName }}</span>
        <a v-if="comment.email" class="email" :href="`mailto:${comment.email}`">{{ comment.email }}</a>
        <a
          v-if="comment.homePage"
          class="homepage"
          :href="comment.homePage"
          target="_blank"
          rel="noopener noreferrer"
        >{{ comment.homePage }}</a>
        <time v-if="date" :datetime="comment.createdAt">{{ date }}</time>
      </div>
      <nav class="actions" aria-label="Действия">
        <button class="action-btn" title="Ответить" @click="emit('reply', comment)">Ответить</button>
        <button v-if="isOwn" class="action-btn danger" :disabled="deleting" @click="onDelete">
          {{ deleting ? '…' : 'Удалить' }}
        </button>
      </nav>
    </header>

    <div class="comment-text" v-html="safeText"></div>

    <div v-if="imageSrc || fileHref" class="attachments">
      <button
        v-if="imageSrc"
        type="button"
        class="thumb"
        @click="lightboxSrc = imageSrc"
      >
        <img :src="imageSrc" alt="Прикреплённое изображение" />
      </button>
      <a v-if="fileHref" class="file-link" :href="fileHref" target="_blank" rel="noopener noreferrer">
        📄 Скачать текстовый файл
      </a>
    </div>

    <div v-if="comment.children.length" class="replies">
      <CommentItem
        v-for="child in comment.children"
        :key="child.id"
        :comment="child"
        :my-user-id="myUserId"
        @reply="emit('reply', $event)"
        @deleted="emit('deleted')"
      />
    </div>

    <Lightbox :src="lightboxSrc" @close="lightboxSrc = null" />
  </article>
</template>

<style scoped>
.comment {
  min-width: 0;
  scroll-margin-top: 24px;
}
.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 50px;
  padding: 6px 10px;
  background: #f5f6f8;
  border-radius: 4px 4px 0 0;
}
.avatar {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border: 3px solid #fff;
  border-radius: 50%;
  background: #e6e3ee;
  color: #69718a;
  font-size: 17px;
  font-weight: 700;
}
.meta {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 2px 10px;
  min-width: 0;
  flex: 1;
}
.author {
  font-size: 14px;
  font-weight: 800;
  color: #202e48;
}
.email,
.homepage {
  font-size: 12px;
  color: #6387c2;
  overflow-wrap: anywhere;
}
time {
  color: #46536c;
  font-size: 12px;
  white-space: nowrap;
}
.actions {
  display: flex;
  gap: 6px;
  margin-left: auto;
}
.action-btn {
  border: 0;
  background: transparent;
  color: #416cba;
  cursor: pointer;
  font-size: 13px;
}
.action-btn.danger {
  color: #a34141;
}
.action-btn:disabled {
  opacity: 0.5;
}
.comment-text {
  padding: 12px 14px 4px;
  color: #3d4b64;
  font-size: 14px;
  line-height: 1.65;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.comment-text :deep(a) {
  color: #416cba;
}
.comment-text :deep(code) {
  background: #eef0f4;
  padding: 1px 5px;
  border-radius: 3px;
}
.attachments {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px 12px;
}
.thumb {
  border: 1px solid #dce1e9;
  border-radius: 4px;
  padding: 2px;
  background: #fff;
  cursor: zoom-in;
  line-height: 0;
}
.thumb img {
  max-width: 160px;
  max-height: 120px;
  object-fit: contain;
}
.file-link {
  font-size: 13px;
  color: #416cba;
}
.replies {
  margin-left: 28px;
  margin-top: 10px;
}
@media (max-width: 540px) {
  .replies {
    margin-left: 14px;
  }
}
</style>
