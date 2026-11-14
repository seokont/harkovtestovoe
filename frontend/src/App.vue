<script setup lang="ts">
import Item from './components/Item/index.vue'
import Form from './components/Form/index.vue'
import { computed, ref, onMounted } from 'vue'
import axios from 'axios'
import type { CommentEntry, CommentNode } from './comment'
const items = ref<CommentEntry[]>([])
const loading = ref(true)
const error = ref('')
const comments = computed(() => {
  const nodes = new Map<string, CommentNode>(
    items.value.map((item) => [item.id, { ...item, children: [] }]),
  )
  const roots: CommentNode[] = []
  for (const node of nodes.values()) {
    const parent = node.referenceId ? nodes.get(node.referenceId) : undefined
    const visited = new Set([node.id])
    let ancestor = parent
    while (ancestor && !visited.has(ancestor.id)) {
      visited.add(ancestor.id)
      ancestor = ancestor.referenceId ? nodes.get(ancestor.referenceId) : undefined
    }
    if (parent && !ancestor) parent.children.push(node)
    else roots.push(node)
  }
  return roots
})
async function loadComments() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await axios.get<CommentEntry[]>('http://localhost:3000/entry')
    items.value = data
  } catch {
    error.value = 'Не удалось загрузить комментарии. Проверьте, что сервер запущен.'
  } finally {
    loading.value = false
  }
}
onMounted(loadComments)
</script>

<template>
  <main class="comments-page">
    <section class="comments-panel" aria-label="Комментарии" :aria-busy="loading">
      <p v-if="loading" class="status" role="status">Загрузка комментариев…</p>
      <p v-else-if="error" class="status status-error" role="alert">{{ error }}</p>
      <p v-else-if="!comments.length" class="status">Пока нет комментариев. Будьте первым!</p>
      <div v-else class="comments-list">
        <Item v-for="comment in comments" :key="comment.id" :comment="comment" />
      </div>
      <div id="comment-form" class="comment-form-section"><Form @submitted="loadComments" /></div>
    </section>
  </main>
</template>

<style>
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  background: #fff;
  font-family: Arial, Helvetica, sans-serif;
  -webkit-font-smoothing: antialiased;
}
button,
input,
textarea {
  font: inherit;
}
.comments-page {
  width: 100%;
  padding: 56px 24px;
}
.comments-panel {
  max-width: 780px;
  margin: 0 auto;
  padding: 28px;
  border: 1px solid #d5d7dc;
  box-shadow: 0 8px 24px #1d294312;
}
.comments-list > .comment + .comment {
  margin-top: 6px;
}
.status {
  margin: 8px 0 28px;
  font-size: 14px;
  line-height: 1.6;
  color: #68748a;
}
.status-error {
  color: #a34141;
}
.comment-form-section {
  margin-top: 10px;
  padding-top: 22px;
  border-top: 1px solid #eceef2;
  scroll-margin-top: 24px;
}
@media (max-width: 540px) {
  .comments-page {
    padding: 20px 12px;
  }
  .comments-panel {
    padding: 14px;
  }
}
</style>
