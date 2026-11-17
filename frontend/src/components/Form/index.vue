<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { createEntry, getCaptcha, uploadImage, uploadText } from '../../api'
import { isBalancedXhtml, sanitizeCommentHtml } from '../../sanitize'

const props = defineProps<{ parentId?: string | null; parentName?: string | null }>()
const emit = defineEmits<{
  submitted: [payload: { token: string; userId: string }]
  cancel: []
}>()

const userName = ref('')
const email = ref('')
const homePage = ref('')
const text = ref('')
const captchaAnswer = ref('')
const captcha = ref<{ captchaId: string; svg: string } | null>(null)
const submitting = ref(false)
const loadingCaptcha = ref(false)
const error = ref('')
const fieldErrors = ref<Record<string, string>>({})
const preview = ref(false)
const imageUrl = ref<string | null>(null)
const imageName = ref<string | null>(null)
const textUrl = ref<string | null>(null)
const textName = ref<string | null>(null)
const textareaEl = ref<HTMLTextAreaElement | null>(null)

const previewHtml = computed(() => sanitizeCommentHtml(text.value))

async function loadCaptcha() {
  loadingCaptcha.value = true
  try {
    captcha.value = await getCaptcha()
  } catch {
    error.value = 'Не удалось загрузить CAPTCHA.'
  } finally {
    loadingCaptcha.value = false
  }
}

onMounted(loadCaptcha)

function validate(): boolean {
  const errs: Record<string, string> = {}
  if (!/^[A-Za-z0-9]+$/.test(userName.value.trim())) {
    errs.userName = 'Только латинские буквы и цифры'
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    errs.email = 'Некорректный e-mail'
  }
  if (homePage.value.trim() && !/^https?:\/\/.+/.test(homePage.value.trim())) {
    errs.homePage = 'Некорректный URL'
  }
  if (!text.value.trim()) {
    errs.text = 'Текст обязателен'
  } else if (!isBalancedXhtml(text.value)) {
    errs.text = 'HTML-теги должны быть корректно закрыты'
  }
  if (!captchaAnswer.value.trim()) {
    errs.captcha = 'Введите код с картинки'
  }
  fieldErrors.value = errs
  return Object.keys(errs).length === 0
}

async function onImageChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    imageUrl.value = await uploadImage(file)
    imageName.value = file.name
    error.value = ''
  } catch (err) {
    error.value = extractError(err) || 'Не удалось загрузить изображение'
  } finally {
    input.value = ''
  }
}

async function onTextFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    textUrl.value = await uploadText(file)
    textName.value = file.name
    error.value = ''
  } catch (err) {
    error.value = extractError(err) || 'Не удалось загрузить файл'
  } finally {
    input.value = ''
  }
}

function extractError(err: unknown): string | undefined {
  const anyErr = err as { response?: { data?: { message?: unknown } } }
  const msg = anyErr?.response?.data?.message
  if (Array.isArray(msg)) return msg.join('; ')
  return typeof msg === 'string' ? msg : undefined
}

function wrapTag(tag: 'i' | 'strong' | 'code' | 'a') {
  const el = textareaEl.value
  const start = el?.selectionStart ?? text.value.length
  const end = el?.selectionEnd ?? text.value.length
  const before = text.value.slice(0, start)
  const sel = text.value.slice(start, end)
  const after = text.value.slice(end)

  if (tag === 'a') {
    const href = window.prompt('URL ссылки:', 'https://') || ''
    const title = window.prompt('Title (необязательно):', '') || ''
    text.value = `${before}<a href="${href}" title="${title}">${sel || 'ссылка'}</a>${after}`
  } else {
    text.value = `${before}<${tag}>${sel}</${tag}>${after}`
  }
}

async function handleSubmit() {
  if (submitting.value) return
  error.value = ''
  if (!validate()) return
  if (!captcha.value) {
    error.value = 'CAPTCHA не загружена'
    return
  }
  submitting.value = true
  try {
    const res = await createEntry({
      userName: userName.value.trim(),
      email: email.value.trim(),
      homePage: homePage.value.trim() || undefined,
      captchaId: captcha.value.captchaId,
      captchaAnswer: captchaAnswer.value,
      text: text.value,
      parentId: props.parentId ?? undefined,
      imagePath: imageUrl.value ?? undefined,
      textFilePath: textUrl.value ?? undefined,
    })
    userName.value = ''
    email.value = ''
    homePage.value = ''
    text.value = ''
    captchaAnswer.value = ''
    imageUrl.value = null
    imageName.value = null
    textUrl.value = null
    textName.value = null
    preview.value = false
    fieldErrors.value = {}
    emit('submitted', { token: res.token, userId: res.entry.userId })
    await loadCaptcha()
  } catch (err) {
    error.value = extractError(err) || 'Не удалось отправить комментарий'
    await loadCaptcha()
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <form class="form" @submit.prevent="handleSubmit" :aria-busy="submitting">
    <div v-if="parentId" class="reply-chip">
      Ответ на комментарий от <strong>{{ parentName || 'пользователя' }}</strong>
      <button type="button" class="chip-cancel" @click="emit('cancel')">Отменить</button>
    </div>

    <div class="row">
      <label class="field">
        <span>User Name *</span>
        <input v-model="userName" type="text" autocomplete="username" />
        <small v-if="fieldErrors.userName" class="field-error">{{ fieldErrors.userName }}</small>
      </label>
      <label class="field">
        <span>E-mail *</span>
        <input v-model="email" type="email" autocomplete="email" />
        <small v-if="fieldErrors.email" class="field-error">{{ fieldErrors.email }}</small>
      </label>
    </div>

    <label class="field">
      <span>Home page</span>
      <input v-model="homePage" type="text" placeholder="https://example.com" />
      <small v-if="fieldErrors.homePage" class="field-error">{{ fieldErrors.homePage }}</small>
    </label>

    <label class="field">
      <span>Text *</span>
      <div class="tagbar" role="toolbar" aria-label="Форматирование">
        <button type="button" title="Курсив" @click="wrapTag('i')"><i>i</i></button>
        <button type="button" title="Жирный" @click="wrapTag('strong')"><strong>strong</strong></button>
        <button type="button" title="Код" @click="wrapTag('code')"><code>code</code></button>
        <button type="button" title="Ссылка" @click="wrapTag('a')"><u>a</u></button>
      </div>
      <textarea
        ref="textareaEl"
        v-model="text"
        rows="5"
        placeholder="Ваш комментарий… Можно использовать <i>, <strong>, <code>, <a>"
      ></textarea>
      <small v-if="fieldErrors.text" class="field-error">{{ fieldErrors.text }}</small>
      <div class="preview-toggle">
        <label><input v-model="preview" type="checkbox" /> Предпросмотр</label>
      </div>
      <div v-if="preview" class="preview" v-html="previewHtml"></div>
    </label>

    <div class="row">
      <label class="field">
        <span>Изображение (JPG, GIF, PNG ≤ 320×240)</span>
        <input type="file" accept=".jpg,.jpeg,.gif,.png" @change="onImageChange" />
        <small v-if="imageName" class="hint">Прикреплено: {{ imageName }}</small>
      </label>
      <label class="field">
        <span>Текстовый файл (TXT ≤ 100 КБ)</span>
        <input type="file" accept=".txt" @change="onTextFileChange" />
        <small v-if="textName" class="hint">Прикреплено: {{ textName }}</small>
      </label>
    </div>

    <div class="row captcha-row">
      <div class="field captcha-box">
        <span>CAPTCHA *</span>
        <div class="captcha-img" v-html="captcha?.svg || ''"></div>
        <button type="button" class="refresh" :disabled="loadingCaptcha" @click="loadCaptcha">
          {{ loadingCaptcha ? '…' : 'Обновить' }}
        </button>
      </div>
      <label class="field">
        <span>Введите код *</span>
        <input v-model="captchaAnswer" type="text" autocomplete="off" maxlength="6" />
        <small v-if="fieldErrors.captcha" class="field-error">{{ fieldErrors.captcha }}</small>
      </label>
    </div>

    <p v-if="error" class="form-error" role="alert">{{ error }}</p>

    <div class="actions">
      <button type="submit" :disabled="submitting">
        {{ submitting ? 'Отправка…' : 'Отправить' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
@media (max-width: 560px) {
  .row {
    grid-template-columns: 1fr;
  }
}
.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.field span {
  font-size: 13px;
  font-weight: 600;
  color: #3d4b64;
}
.field input,
.field textarea {
  padding: 8px 10px;
  border: 1px solid #dce1e9;
  border-radius: 4px;
  font: inherit;
  font-size: 14px;
  color: #3d4b64;
}
.field input:focus,
.field textarea:focus {
  outline: 2px solid #b4c7e7;
  outline-offset: 1px;
}
.field textarea {
  min-height: 120px;
  resize: vertical;
}
.field-error {
  color: #a34141;
  font-size: 12px;
}
.hint {
  color: #68748a;
  font-size: 12px;
}
.tagbar {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.tagbar button {
  min-width: 34px;
  padding: 4px 8px;
  border: 1px solid #dce1e9;
  background: #f5f6f8;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}
.preview-toggle {
  font-size: 13px;
  color: #3d4b64;
}
.preview {
  padding: 10px;
  border: 1px dashed #d5d7dc;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.65;
  color: #3d4b64;
  overflow-wrap: anywhere;
}
.captcha-row {
  align-items: end;
}
.captcha-box {
  align-items: flex-start;
}
.captcha-img {
  border: 1px solid #dce1e9;
  border-radius: 4px;
  background: #f0f2f7;
  line-height: 0;
}
.captcha-img :deep(svg) {
  max-width: 100%;
}
.refresh {
  padding: 4px 10px;
  border: 1px solid #dce1e9;
  background: #f5f6f8;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}
.reply-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #eef2fb;
  border-radius: 4px;
  font-size: 13px;
  color: #3d4b64;
}
.chip-cancel {
  margin-left: auto;
  border: 0;
  background: transparent;
  color: #416cba;
  cursor: pointer;
  font-size: 13px;
}
.form-error {
  margin: 0;
  color: #a34141;
  font-size: 14px;
}
.actions {
  display: flex;
  justify-content: flex-end;
}
.actions button {
  padding: 10px 20px;
  background: #6387c2;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}
.actions button:disabled {
  opacity: 0.6;
  cursor: wait;
}
</style>
