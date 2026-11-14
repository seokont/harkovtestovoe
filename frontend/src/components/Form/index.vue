<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
const emit = defineEmits<{ submitted: [] }>()
const submitting = ref(false)
const error = ref('')
const value = ref({
  userName: '',
  email: '',
  text: '',
  homePage: '',
})

const handleSubmit = async () => {
  if (submitting.value) return
  submitting.value = true
  error.value = ''
  try {
    await axios.post('http://localhost:3000/entry', { ...value.value })
    value.value.userName = ''
    value.value.text = ''
    value.value.email = ''
    value.value.homePage = ''
    emit('submitted')
  } catch {
    error.value = 'Не удалось отправить комментарий. Попробуйте ещё раз.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <form class="form-container" @submit.prevent="handleSubmit" :aria-busy="submitting">
    <input
      placeholder="User Name"
      aria-label="User Name"
      type="text"
      v-model="value.userName"
      :disabled="submitting"
      required
    />
    <input
      placeholder="Email"
      aria-label="Email"
      type="email"
      v-model="value.email"
      :disabled="submitting"
      required
    />
    <input
      placeholder="Home Page"
      aria-label="Home Page"
      type="url"
      v-model="value.homePage"
      :disabled="submitting"
    />
    <textarea
      placeholder="Text"
      aria-label="Text"
      v-model="value.text"
      :disabled="submitting"
      required
    ></textarea>

    <p v-if="error" class="form-error" role="alert">{{ error }}</p>
    <div>
      <button type="submit" :disabled="submitting">
        {{ submitting ? 'Отправка…' : 'Submit' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.form-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.form-error {
  width: 100%;
  margin: 0;
  color: #a34141;
  font-size: 14px;
}
.form-container button:disabled {
  opacity: 0.6;
  cursor: wait;
}

.form-container > input,
.form-container > textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #dce1e9;
  border-radius: 4px;
}

.form-container > div {
  width: 100%;
  display: flex;
  justify-content: flex-end;
}

.form-container > textarea {
  min-height: 112px;
  resize: vertical;
  line-height: 1.65;
}
.form-container > input,
.form-container > textarea {
  color: #3d4b64;
  font-size: 14px;
}
.form-container > input:focus,
.form-container > textarea:focus {
  outline: 2px solid #b4c7e7;
  outline-offset: 1px;
}

.form-container > div > button {
  padding: 8px 16px;
  background-color: #6387c2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
