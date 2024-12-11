<template>
    <Button variant="outline" size="icon" @click="toggleMode">
      <SunIcon class="h-[1.2rem] w-[1.2rem] rotate-0 scale-0 stroke-white transition-all dark:-rotate-90 dark:scale-100" />
      <MoonIcon class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-100 stroke-black transition-all dark:rotate-0 dark:scale-0" />
      <span class="sr-only">Toggle theme</span>
    </Button>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { Button } from '@/shadcnComponents/ui/button'
  import { SunIcon, MoonIcon } from 'lucide-vue-next'
  
  const isDark = ref(false)
  
  const toggleMode = () => {
    isDark.value = !isDark.value
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
  
  onMounted(() => {
    isDark.value = document.documentElement.classList.contains('dark')
  })
  </script>