<script setup lang="ts">
import { ref } from "vue";
import { useAudio } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { message } from "@/utils/message";

import Upload from "@iconify-icons/ri/upload-line";
import Preview from "@iconify-icons/ri/headphone-line";
import More from "@iconify-icons/ep/more-filled";
import Delete from "@iconify-icons/ep/delete";
import EditPen from "@iconify-icons/ep/edit-pen";
import Refresh from "@iconify-icons/ep/refresh";
import AddFill from "@iconify-icons/ri/add-circle-line";
import UploadAudioDialog from "./form/upload.vue";
import CreateAudioDialog from "./form/create.vue";
import PreviewDialog from "./form/preview.vue";

const formRef = ref();
const tableRef = ref();

const {
  form,
  loading,
  columns,
  dataList,
  selectedNum,
  pagination,
  buttonClass,
  deviceDetection,
  categoryOptions,
  onSearch,
  resetForm,
  onbatchDel,
  openDialog,
  handleUpdate,
  handleDelete,
  handleUpload,
  openPreviewDialog,
  handleSizeChange,
  onSelectionCancel,
  handleCurrentChange,
  handleSelectionChange
} = useAudio(tableRef);

const showUploadDialog = ref(false);
const selectedAudioId = ref<number | null>(null);
const showCreateDialog = ref(false);
const showPreviewDialog = ref(false);
const previewUrl = ref("");
const previewTitle = ref("");

function openUploadDialog(row) {
  selectedAudioId.value = row.id;
  showUploadDialog.value = true;
}

function openCreateDialog() {
  showCreateDialog.value = true;
}

function showPreview(row) {
  const url = row.audio_url || row.fileUrl || row.audio;
  if (!url) {
    message("该记录暂无音频地址", { type: "warning" });
    return;
  }
  // 若url不含http则拼接后端静态地址
  const fullUrl = /^https?:\/\//.test(url) ? url : `${import.meta.env.VITE_BASE_URL || ''}${url.startsWith('/') ? '' : '/'}${url}`;
  previewUrl.value = fullUrl;
  previewTitle.value = row.title;
  showPreviewDialog.value = true;
}
</script>

<template>
  <div :class="['flex', 'justify-between', deviceDetection() && 'flex-wrap']">
    <div :class="[deviceDetection() ? ['w-full', 'mt-2'] : 'w-full']">
      <el-form
        ref="formRef"
        :inline="true"
        :model="form"
        class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px] overflow-auto"
      >
        <el-form-item label="标题：" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题" clearable class="!w-[180px]" />
        </el-form-item>
        <el-form-item label="分类：" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="请选择分类" clearable class="!w-[180px]">
            <el-option v-for="item in categoryOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="useRenderIcon('ri:search-line')" :loading="loading" @click="onSearch">搜索</el-button>
          <el-button :icon="useRenderIcon(Refresh)" @click="resetForm(formRef)">重置</el-button>
        </el-form-item>
      </el-form>

      <PureTableBar title="音频管理" :columns="columns" @refresh="onSearch">
        <template #buttons>
          <el-button type="primary" :icon="useRenderIcon(AddFill)" @click="openCreateDialog">新增音频</el-button>
        </template>
        <template v-slot="{ size, dynamicColumns }">
          <div v-if="selectedNum > 0" v-motion-fade class="bg-[var(--el-fill-color-light)] w-full h-[46px] mb-2 pl-4 flex items-center">
            <div class="flex-auto">
              <span style="font-size: var(--el-font-size-base)" class="text-[rgba(42,46,54,0.5)] dark:text-[rgba(220,220,242,0.5)]">已选 {{ selectedNum }} 项</span>
              <el-button type="primary" text @click="onSelectionCancel">取消选择</el-button>
            </div>
            <el-popconfirm title="是否确认删除?" @confirm="onbatchDel">
              <template #reference>
                <el-button type="danger" text class="mr-1">批量删除</el-button>
              </template>
            </el-popconfirm>
          </div>
          <pure-table
            ref="tableRef"
            row-key="id"
            adaptive
            :adaptiveConfig="{ offsetBottom: 108 }"
            align-whole="center"
            table-layout="auto"
            :loading="loading"
            :size="size"
            :data="dataList"
            :columns="dynamicColumns"
            :pagination="{ ...pagination, size }"
            :header-cell-style="{ background: 'var(--el-fill-color-light)', color: 'var(--el-text-color-primary)' }"
            @selection-change="handleSelectionChange"
            @page-size-change="handleSizeChange"
            @page-current-change="handleCurrentChange"
          >
            <template #operation="{ row }">
              <el-button class="reset-margin" link type="primary" :size="size" :icon="useRenderIcon(EditPen)" @click="openDialog('修改', row)">
                修改
              </el-button>
              <el-popconfirm :title="`是否确认删除编号为 ${row.id} 的这条数据`" @confirm="handleDelete(row)">
                <template #reference>
                  <el-button class="reset-margin" link type="primary" :size="size" :icon="useRenderIcon(Delete)">
                    删除
                  </el-button>
                </template>
              </el-popconfirm>
              <el-dropdown>
                <el-button class="ml-3 mt-[2px]" link type="primary" :size="size" :icon="useRenderIcon(More)" @click="handleUpdate(row)" />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item>
                      <el-button :class="buttonClass" link type="primary" :size="size" :icon="useRenderIcon(Upload)" @click="handleUpload(row)">上传封面</el-button>
                    </el-dropdown-item>
                    <el-dropdown-item>
                      <el-button :class="buttonClass" link type="primary" :size="size" :icon="useRenderIcon(Upload)" @click="openUploadDialog(row)">上传音频</el-button>
                    </el-dropdown-item>
                    <el-dropdown-item>
                      <el-button :class="buttonClass" link type="primary" :size="size" :icon="useRenderIcon(Preview)" @click="showPreview(row)">预览音频</el-button>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </pure-table>
          <!-- 上传音频弹窗 -->
          <UploadAudioDialog
            v-if="showUploadDialog"
            :visible="showUploadDialog"
            :audioId="selectedAudioId"
            @update:visible="showUploadDialog = $event"
            @success="onSearch"
          />
          <!-- 新增音频弹窗 -->
          <CreateAudioDialog
            v-if="showCreateDialog"
            :visible="showCreateDialog"
            @update:visible="showCreateDialog = $event"
            @success="onSearch"
          />
          <!-- 预览音频弹窗 -->
          <PreviewDialog
            v-if="showPreviewDialog"
            :visible="showPreviewDialog"
            :audioUrl="previewUrl"
            :title="previewTitle"
            @update:visible="showPreviewDialog = $event"
          />
        </template>
      </PureTableBar>
    </div>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}
</style> 