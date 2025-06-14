<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from "vue";
import { updateAudioFile } from "@/api/system";
import { message } from "@/utils/message";
import UploadIcon from "@iconify-icons/ri/upload-2-line";

const props = defineProps<{ audioId: number; visible: boolean }>();
const emit = defineEmits(["update:visible", "success"]);

const fileList = ref<any[]>([]);
const isVisible = ref(props.visible);
const audioUrl = ref(""); // 预览 URL

watch(
  () => props.visible,
  newVal => {
    isVisible.value = newVal;
  }
);

function handleChange(file) {
  const allow = [".mp3", ".wav", ".flac"];
  if (!allow.some(ext => file.raw.name.endsWith(ext))) {
    message("仅支持 mp3/wav/flac 格式", { type: "warning" });
    fileList.value = [];
    return;
  }
  fileList.value = [file.raw];
  if (audioUrl.value) URL.revokeObjectURL(audioUrl.value);
  audioUrl.value = URL.createObjectURL(file.raw);
}

async function submitForm() {
  if (!fileList.value.length) {
    message("请先选择文件", { type: "warning" });
    return;
  }
  const formData = new FormData();
  formData.append("file", fileList.value[0]);
  try {
    const res = await updateAudioFile(props.audioId, formData);
    if (res.code === 0) {
      message("上传成功", { type: "success" });
      emit("update:visible", false);
      emit("success");
    } else {
      message(res.message || "上传失败", { type: "error" });
    }
  } catch (e) {
    message("上传失败", { type: "error" });
  }
}
</script>

<template>
  <el-dialog v-model="isVisible" title="上传音频" @close="emit('update:visible', false)">
    <el-upload :file-list="fileList" :auto-upload="false" :limit="1" drag action="#" @change="handleChange">
      <div class="el-upload__text">
        <IconifyIconOffline :icon="UploadIcon" width="26" class="m-auto mb-2" />
        点击或拖拽上传 (mp3/wav/flac)
      </div>
    </el-upload>
    <audio v-if="audioUrl" :src="audioUrl" controls class="mt-3" />
    <template #footer>
      <el-button @click="emit('update:visible', false)">取消</el-button>
      <el-button type="primary" @click="submitForm">提交</el-button>
    </template>
  </el-dialog>
</template>

<style scoped></style> 