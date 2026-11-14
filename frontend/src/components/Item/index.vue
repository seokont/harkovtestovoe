<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CommentNode } from '../../comment'
defineOptions({ name: 'CommentItem' })
const props = defineProps<{ comment: CommentNode }>()
const saved = ref(false)
const vote = ref(0)
const name = computed(() => props.comment.userName || 'Anonym')
const date = computed(() => {
  const value = props.comment.createdAt || props.comment.date
  if (!value || Number.isNaN(new Date(value).getTime())) return ''
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value)).replace(', ', ' в ')
})
</script>

<template>
  <article :id="`comment-${comment.id}`" class="comment">
    <header class="comment-header">
      <span class="avatar" aria-hidden="true">{{ name.slice(0, 1).toUpperCase() }}</span>
      <div class="comment-meta">
        <span class="author">{{ name }}</span>
        <time v-if="date" :datetime="comment.createdAt || comment.date">{{ date }}</time>
      </div>
      <nav class="comment-actions" aria-label="Действия с комментарием">
        <a :href="`#comment-${comment.id}`" class="icon-button" aria-label="Ссылка на комментарий" title="Ссылка на комментарий">
          <svg viewBox="0 0 20 20"><path d="M7 3 5 17M14 3l-2 14M3 7h14M2 13h14" /></svg>
        </a>
        <button class="icon-button" :class="{ saved }" :aria-pressed="saved" aria-label="Отметить комментарий" title="Отметить" @click="saved = !saved">
          <svg viewBox="0 0 20 20"><path d="M5 3h10v14l-5-4-5 4Z" :fill="saved ? 'currentColor' : 'none'" /></svg>
        </button>
        <a href="#comment-form" class="icon-button" aria-label="Перейти к форме комментария" title="К форме комментария">
          <svg viewBox="0 0 20 20"><path d="M6 3v13M6 8h5a4 4 0 0 1 4 4v4M3 13l3 3 3-3" /></svg>
        </a>
      </nav>
      <div class="comment-rating" aria-label="Оценка комментария">
        <button class="icon-button" aria-label="Нравится" :aria-pressed="vote === 1" @click="vote = vote === 1 ? 0 : 1">↑</button>
        <span aria-live="polite">{{ vote }}</span>
        <button class="icon-button" aria-label="Не нравится" :aria-pressed="vote === -1" @click="vote = vote === -1 ? 0 : -1">↓</button>
      </div>
    </header>
    <div class="comment-text">{{ comment.text }}</div>
    <div v-if="comment.children.length" class="comment-replies">
      <CommentItem v-for="child in comment.children" :key="child.id" :comment="child" />
    </div>
  </article>
</template>

<style scoped>
.comment { min-width: 0; scroll-margin-top: 24px; }
.comment-header { display: flex; align-items: center; gap: 12px; min-height: 50px; padding: 6px 10px; background: #f5f6f8; }
.avatar { width: 38px; height: 38px; flex-shrink: 0; display: grid; place-items: center; border: 3px solid #fff; border-radius: 50%; background: #e6e3ee; color: #69718a; font-size: 17px; font-weight: 700; }
.comment-meta { display: flex; align-items: baseline; flex-wrap: wrap; gap: 8px; min-width: 0; }
.author { font-size: 14px; line-height: 1.4; font-weight: 800; color: #202e48; overflow-wrap: anywhere; }
time { color: #46536c; font-size: 12px; white-space: nowrap; }
.comment-actions { display: flex; align-items: center; gap: 6px; margin-left: 2px; }
.comment-rating { display: flex; align-items: center; gap: 2px; margin-left: auto; color: #8390a5; font-size: 12px; }
.comment-rating .icon-button { color: #a8b1c1; }
.comment-rating .icon-button[aria-pressed='true'] { color: #416cba; }
.icon-button { width: 19px; height: 25px; display: grid; place-items: center; border: 0; padding: 2px; background: transparent; color: #8ba7dc; cursor: pointer; border-radius: 3px; }
.icon-button svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
.icon-button:hover, .icon-button.saved { color: #416cba; background: #e8edf6; }
.icon-button:focus-visible { outline: 2px solid #668ac8; outline-offset: 2px; }
.comment-text { padding: 14px 0 22px; color: #3d4b64; font-size: 14px; line-height: 1.65; white-space: pre-wrap; overflow-wrap: anywhere; }
.comment-replies { margin-left: 28px; }
@media (max-width: 540px) {
  .comment-header { gap: 7px; padding: 6px; }
  .comment-header { flex-wrap: wrap; }
  .comment-meta { gap: 2px 7px; flex: 1; }
  .comment-actions { gap: 3px; }
  .comment-replies { margin-left: 14px; }
  .avatar { width: 32px; height: 32px; font-size: 14px; }
  .author { font-size: 13px; }
  time { font-size: 10px; }
  .comment-text { font-size: 13px; }
}
</style>
