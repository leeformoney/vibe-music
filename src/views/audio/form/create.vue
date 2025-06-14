<script setup lang="ts">
import { ref, reactive, watch, defineProps, defineEmits, onMounted } from "vue";
import {
  addAudio,
  updateAudioFile,
  updateAudioCover,
  getCategoryList
} from "@/api/system";
import { message } from "@/utils/message";
import UploadIcon from "@iconify-icons/ri/upload-2-line";

const props = defineProps<{ visible: boolean }>();
const emit = defineEmits(["update:visible", "success"]);

const isVisible = ref(props.visible);
watch(
  () => props.visible,
  v => (isVisible.value = v)
);

const formRef = ref();
const form = reactive({
  title: "",
  categoryId: null as number | null,
  audioFile: null as File | null,
  coverFile: null as File | null
});

const rules = {
  title: [{ required: true, message: "请输入标题", trigger: "blur" }],
  categoryId: [{ required: true, message: "请选择分类", trigger: "change" }],
  audioFile: [{ required: true, message: "请上传音频", trigger: "change" }]
};

const categoryOptions = ref<any[]>([]);
async function loadCategories() {
  const res = await getCategoryList({ pageNum: 1, pageSize: 100 });
  if (res.code === 0) {
    // @ts-ignore
    categoryOptions.value = res.data.items || res.data.records || [];
  }
}
onMounted(loadCategories);

const isSubmitting = ref(false);

function handleAudioChange(file) {
  const allow = [".mp3", ".wav", ".flac"];
  if (!allow.some(ext => file.raw.name.endsWith(ext))) {
    message("仅支持 mp3/wav/flac", { type: "warning" });
    form.audioFile = null;
    return false;
  }
  form.audioFile = file.raw;
  return false;
}
function handleCoverChange(file) {
  form.coverFile = file.raw;
  return false;
}

async function handleSubmit() {
  if (isSubmitting.value) return;
  await formRef.value?.validate?.();
  isSubmitting.value = true;
  const { title, categoryId } = form;
  const res = await addAudio({ title, categoryId });
  if (res.code !== 0) {
    message(res.message || "新增失败", { type: "error" });
    isSubmitting.value = false;
    return;
  }
  // @ts-ignore
  const newId = (res.data?.id ?? res.data) ?? null;
  if (!newId) {
    message("未获取到新音频ID", { type: "error" });
    isSubmitting.value = false;
    return;
  }
  // 上传文件
  try {
    if (form.audioFile) {
      const fd = new FormData();
      fd.append("file", form.audioFile);
      await updateAudioFile(newId, fd);
    }
    if (form.coverFile) {
      const fd2 = new FormData();
      fd2.append("file", form.coverFile);
      await updateAudioCover(newId, fd2);
    }
    message("新增成功", { type: "success" });
    close();
    emit("success");
  } catch (e) {
    console.error(e);
    message("文件上传失败", { type: "error" });
  } finally {
    isSubmitting.value = false;
  }
}
function close() {
  isVisible.value = false;
  emit("update:visible", false);
}
</script>

<template>
  <el-dialog v-model="isVisible" title="新增音频" width="600px" @close="close">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
      <el-form-item label="标题" prop="title">
        <el-input v-model="form.title" />
      </el-form-item>
      <el-form-item label="分类" prop="categoryId">
        <el-select v-model="form.categoryId" placeholder="请选择分类" filterable>
          <el-option v-for="c in categoryOptions" :key="c.id" :label="c.name" :value="c.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="音频文件" prop="audioFile">
        <el-upload :auto-upload="false" :limit="1" accept="audio/*" :on-change="handleAudioChange">
          <el-button type="primary">选择文件</el-button>
        </el-upload>
        <span v-if="form.audioFile" class="ml-2">{{ form.audioFile.name }}</span>
      </el-form-item>
      <el-form-item label="封面">
        <el-upload :auto-upload="false" :limit="1" accept="image/*" :on-change="handleCoverChange">
          <el-button>选择图片</el-button>
        </el-upload>
        <span v-if="form.coverFile" class="ml-2">{{ form.coverFile.name }}</span>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="close">取消</el-button>
      <el-button type="primary" :loading="isSubmitting" @click="handleSubmit" :disabled="isSubmitting">确定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped></style> 