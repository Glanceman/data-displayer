<template>
  <div class="min-h-screen bg-background text-foreground">
    <header class="bg-primary text-primary-foreground py-4 px-6 shadow-md">
      <h1 class="text-2xl font-bold">Data Displayer Web</h1>
    </header>
    <main class="container mx-auto px-4 py-8">
      <Card class="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Content Display</CardTitle>
          <CardDescription>View content from the backend server</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
            <div class="w-full sm:w-1/2">
              <Label for="sequence-select" class="mb-2 block">Select Sequence</Label>
              <Select v-model="selectedSequenceIndex">
                <SelectTrigger id="sequence-select" class="w-full">
                  <SelectValue placeholder="Select a sequence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem v-for="(seq, index) in sequences" :key="String(index)" :value="String(index)">
                      Sequence {{ index + 1 }} ({{ seq.messages.length }} messages)
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div class="flex space-x-2">
              <Button @click="clearSequences" variant="outline">Clear All</Button>
              <Button @click="reconnectToBackend" variant="outline" :disabled="!isDisconnected || isReconnecting">
                <RefreshCwIcon v-if="isReconnecting" class="mr-2 h-4 w-4 animate-spin" />
                <PlugIcon v-else class="mr-2 h-4 w-4" :class="{ 'text-red-500': isDisconnected }" />
                {{ isDisconnected ? 'Reconnect' : 'Connected' }}
              </Button>
              <ModeToggle />
            </div>
          </div>
          <Tabs v-model="activeTab" class="w-full">
            <TabsList class="grid w-full grid-cols-2">
              <TabsTrigger value="raw">Raw</TabsTrigger>
              <TabsTrigger value="formatted">Formatted</TabsTrigger>
            </TabsList>
            <TabsContent value="raw">
              <ScrollArea class="h-[550px] w-full rounded-md border p-4 bg-muted">
                <div v-if="isLoading" class="flex justify-center items-center h-full">
                  <Loader2Icon class="animate-spin" />
                </div>
                <div v-else-if="currentSequence.messages.length === 0" class="text-center text-muted-foreground">
                  No messages in this sequence
                </div>
                <div v-else v-for="(message, index) in currentSequence.messages" :key="index" class="mb-4">
                  <p class="text-sm text-muted-foreground mb-1">{{ formatTimestamp(message.timestamp) }}</p>
                  <p class="whitespace-pre-wrap bg-card p-2 rounded">{{ message.content }}</p>
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="formatted">
              <ScrollArea class="h-[550px] w-full rounded-md border bg-muted">
                <div v-if="isLoading" class="flex justify-center items-center h-full">
                  <Loader2Icon class="animate-spin" />
                </div>
                <div v-else-if="currentSequence.messages.length === 0" class="text-center text-muted-foreground p-4">
                  No messages in this sequence
                </div>
                <div v-else v-for="(message, index) in currentSequence.messages" :key="index" class="mb-4 p-4">
                  <p class="text-sm text-muted-foreground mb-1">{{ formatTimestamp(message.timestamp) }}</p>
                  <VCodeBlock
                    :code="message.content"
                    highlightjs
                    :lang="message.contentType"
                    theme="neon-bunny"
                  />
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/shadcnComponents/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from '@/shadcnComponents/ui/select'
import { Label } from '@/shadcnComponents/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shadcnComponents/ui/tabs'
import { ScrollArea } from '@/shadcnComponents/ui/scroll-area'
import { Button } from '@/shadcnComponents/ui/button'
import VCodeBlock from '@wdns/vue-code-block'
import { Loader2Icon, PlugIcon, RefreshCwIcon } from 'lucide-vue-next'
import io from 'socket.io-client'
import ModeToggle from './components/ModeToggle.vue'

const sequences = ref([])
const selectedSequenceIndex = ref('0')
const activeTab = ref('raw')
const isLoading = ref(false)
const isDisconnected = ref(false)
const isReconnecting = ref(false)
let socket = null

const currentSequence = computed(() => {
  return sequences.value[selectedSequenceIndex.value] || { messages: [] }
})

const formatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const addMessageToSequence = (message) => {
  const now = Date.now()
  if (sequences.value.length === 0 || now - sequences.value[sequences.value.length - 1].lastTimestamp > 1000) {
    sequences.value.push({
      messages: [message],
      lastTimestamp: now
    })
    selectedSequenceIndex.value = String(sequences.value.length - 1)
  } else {
    sequences.value[sequences.value.length - 1].messages.push(message)
    sequences.value[sequences.value.length - 1].lastTimestamp = now
  }
}

const clearSequences = () => {
  sequences.value = []
  selectedSequenceIndex.value = '0'
}

const connectToBackend = () => {
  isReconnecting.value = true
  socket = io(import.meta.env.VITE_SOCKET_IO_URL)

  socket.on('connect', () => {
    isDisconnected.value = false
    isReconnecting.value = false
  })

  socket.on('data', (dataFromServer) => {
    isLoading.value = true
    const newMessage = {
      content: dataFromServer.content,
      contentType: dataFromServer.content_type,
      timestamp: Date.now()
    }
    addMessageToSequence(newMessage)
    isLoading.value = false
  })

  socket.on('disconnect', () => {
    console.log('Disconnected from server')
    isDisconnected.value = true
  })
}

const reconnectToBackend = () => {
  if (isDisconnected.value) {
    if (socket) {
      socket.disconnect()
    }
    connectToBackend()
  }
}

onMounted(() => {
  isDisconnected.value=true;

  connectToBackend()
})

onUnmounted(() => {
  if (socket) {
    socket.disconnect()
  }
})
</script>