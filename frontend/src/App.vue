<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { io } from 'socket.io-client'
import Item from './components/Item/index.vue'
import Form from './components/Form/index.vue'
import { API_BASE, getEntries } from './api'
import type { CommentNode } from './comment'

type SortField = 'createdAt' | 'userName' | 'email'
type SortOrder = 'ASC' | 'DESC'

const items = ref<CommentNode[]>([])
const total = ref(0)
const page = ref(1)
const totalPages = ref(1)
const limit = 25
const sortBy = ref<SortField>('createdAt')
const order = ref<SortOrder>('DESC')
const loading = ref(true)
const error = ref('')

const replyTo = ref<{ id: string; name: string } | null>(null)
const token = ref<string | null>(localStorage.getItem('token'))
const myUserId = ref<string | null>(localStorage.getItem('myUserId'))

let socket: ReturnType<typeof io> | null = null

const pages = computed(() => {
  const t = totalPages.value
  const cur = page.value
  const start = Math.max(1, cur - 3)
  const end = Math.min(t, cur + 3)
  const out: number[] = []
  for (let i = start; i <= end; i++) out.push(i)
  return out
})

async function loadComments() {
  loading.value = true
  error.value = ''
  try {
    const data = await getEntries({
      sortBy: sortBy.value,
      order: order.value,
      page: page.value,
      limit,
    })
    items.value = data.items
    total.value = data.total
    totalPages.value = data.totalPages
  } catch {
    error.value = 'Не удалось загрузить комментарии. Проверьте, что сервер запущен.'
  } finally {
    loading.value = false
  }
}

function toggleSort(field: SortField) {
  if (sortBy.value === field) {
    order.value = order.value === 'ASC' ? 'DESC' : 'ASC'
  } else {
    sortBy.value = field
    order.value = 'ASC'
  }
  page.value = 1
  loadComments()
}

function arrow(field: SortField): string {
  if (sortBy.value !== field) return ''
  return order.value === 'ASC' ? '↑' : '↓'
}

function go(p: number) {
  if (p < 1 || p > totalPages.value || p === page.value) return
  page.value = p
  loadComments()
}

function onSubmitted(payload: { token: string; userId: string }) {
  token.value = payload.token
  myUserId.value = payload.userId
  localStorage.setItem('token', payload.token)
  localStorage.setItem('myUserId', payload.userId)
  replyTo.value = null
  loadComments()
}

function onReply(node: CommentNode) {
  replyTo.value = { id: node.id, name: node.userName }
  document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
  loadComments()
  socket = io(`${API_BASE}/comments`, { transports: ['websocket', 'polling'] })
  socket.on('comment:created', () => loadComments())
  socket.on('connect_error', () => {
    // real-time is optional; list still works via polling on reload
  })
})

onUnmounted(() => {
  socket?.disconnect()
})
</script>

<template>
  <main class="page">
    <section class="panel" aria-label="Комментарии">
      <h1>Комментарии</h1>

      <div class="toolbar">
        <div class="sortbar" role="group" aria-label="Сортировка">
          <span class="sortbar-label">Сортировка:</span>
          <button :class="{ active: sortBy === 'userName' }" @click="toggleSort('userName')">
            User Name {{ arrow('userName') }}
          </button>
          <button :class="{ active: sortBy === 'email' }" @click="toggleSort('email')">
            E-mail {{ arrow('email') }}
          </button>
          <button :class="{ active: sortBy === 'createdAt' }" @click="toggleSort('createdAt')">
            Дата {{ arrow('createdAt') }}
          </button>
        </div>
        <span class="page-info">Страница {{ page }} из {{ totalPages }} · всего {{ total }}</span>
      </div>

      <p v-if="loading" class="status" role="status">Загрузка комментариев…</p>
      <p v-else-if="error" class="status error" role="alert">{{ error }}</p>
      <p v-else-if="!items.length" class="status">Пока нет комментариев. Будьте первым!</p>
      <div v-else class="list">
        <Item
          v-for="c in items"
          :key="c.id"
          :comment="c"
          :my-user-id="myUserId"
          @reply="onReply"
          @deleted="loadComments"
        />
      </div>

      <nav v-if="totalPages > 1" class="pagination" aria-label="Пагинация">
        <button :disabled="page <= 1" @click="go(page - 1)">← Назад</button>
        <button
          v-for="p in pages"
          :key="p"
          :class="{ active: p === page }"
          @click="go(p)"
        >
          {{ p }}
        </button>
        <button :disabled="page >= totalPages" @click="go(page + 1)">Вперёд →</button>
      </nav>

      <div id="comment-form" class="form-section">
        <h2>Оставить комментарий</h2>
        <Form
          :parent-id="replyTo?.id ?? null"
          :parent-name="replyTo?.name ?? null"
          @submitted="onSubmitted"
          @cancel="replyTo = null"
        />
      </div>
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
.page {
  width: 100%;
  padding: 40px 20px;
}
.panel {
  max-width: 820px;
  margin: 0 auto;
  padding: 28px;
  border: 1px solid #d5d7dc;
  box-shadow: 0 8px 24px #1d294312;
}
h1 {
  margin: 0 0 16px;
  font-size: 22px;
  color: #202e48;
}
h2 {
  margin: 0 0 14px;
  font-size: 17px;
  color: #202e48;
}
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
  padding: 10px 12px;
  background: #f5f6f8;
  border-radius: 4px;
}
.sortbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.sortbar-label {
  font-size: 13px;
  color: #68748a;
}
.sortbar button {
  padding: 5px 10px;
  border: 1px solid #dce1e9;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: #3d4b64;
}
.sortbar button.active {
  background: #e8edf6;
  color: #416cba;
  border-color: #b4c7e7;
}
.page-info {
  font-size: 13px;
  color: #68748a;
}
.status {
  margin: 8px 0 24px;
  font-size: 14px;
  line-height: 1.6;
  color: #68748a;
}
.status.error {
  color: #a34141;
}
.list > .comment {
  margin-bottom: 14px;
  border: 1px solid #e7eaf0;
  border-radius: 4px;
}
.pagination {
  display: flex;
  gap: 6px;
  margin: 18px 0;
}
.pagination button {
  min-width: 34px;
  padding: 6px 10px;
  border: 1px solid #dce1e9;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: #3d4b64;
}
.pagination button.active {
  background: #6387c2;
  color: #fff;
  border-color: #6387c2;
}
.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.form-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eceef2;
  scroll-margin-top: 24px;
}
@media (max-width: 560px) {
  .page {
    padding: 16px 10px;
  }
  .panel {
    padding: 14px;
  }
}
</style>
