<script setup lang="ts">
import { defineProps, defineEmits, watch, ref } from "vue";

const props = defineProps<{ visible: boolean; audioUrl: string; title: string }>();
const emit = defineEmits(["update:visible"]);

const show = ref(props.visible);
watch(
  () => props.visible,
  v => (show.value = v)
);
</script>

<template>
  <el-dialog v-model="show" :title="title || '预览音频'" width="500px" @close="emit('update:visible', false)">
    <audio :src="audioUrl" controls style="width:100%" />
  </el-dialog>
</template>

<style scoped></style> 