<script setup lang="ts">
import { watch, onMounted, onUnmounted } from 'vue'

const props = defineProps<{ src: string | null; alt?: string }>()
const emit = defineEmits<{ close: [] }>()

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

watch(
  () => props.src,
  (v) => {
    if (v) {
      document.addEventListener('keydown', onKeydown)
    } else {
      document.removeEventListener('keydown', onKeydown)
    }
  },
)

onMounted(() => {
  if (props.src) document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div v-if="src" class="lightbox" role="dialog" aria-modal="true" @click.self="emit('close')">
    <button class="lightbox-close" aria-label="Закрыть" @click="emit('close')">×</button>
    <img :src="src" :alt="alt || 'Прикреплённое изображение'" />
  </div>
</template>

<style scoped>
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.82);
  padding: 32px;
}
.lightbox img {
  max-width: 90vw;
  max-height: 88vh;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
}
.lightbox-close {
  position: absolute;
  top: 18px;
  right: 24px;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
}
</style>
