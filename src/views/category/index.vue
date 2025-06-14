<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { message } from "@/utils/message";
// TODO: 请替换为实际接口实现
import {
  getCategoryList,
  addCategory,
  updateCategory,
  deleteCategory,
  deleteCategories
} from "@/api/system";

import EditPen from "@iconify-icons/ep/edit-pen";
import Delete from "@iconify-icons/ep/delete";
import Refresh from "@iconify-icons/ep/refresh";
import AddFill from "@iconify-icons/ri/add-circle-line";

const form = reactive({
  pageNum: 1,
  pageSize: 10,
  name: ""
});

const formRef = ref();
const tableRef = ref();
const dataList = ref([]);
const loading = ref(true);
const pagination = reactive({
  total: 0,
  pageSize: 10,
  currentPage: 1,
  background: true
});

const columns: TableColumnList = [
  { label: "选择", type: "selection", fixed: "left", reserveSelection: true },
  { label: "ID", prop: "id", width: 80 },
  { label: "分类名称", prop: "name", minWidth: 160 },
  { label: "描述", prop: "description", minWidth: 200 },
  { label: "操作", fixed: "right", width: 120, slot: "operation" }
];

const dialogVisible = ref(false);
const dialogTitle = ref("新增分类");
const dialogFormRef = ref();
const dialogForm = reactive({
  id: undefined as number | undefined,
  name: "",
  description: ""
});

const dialogRules = {
  name: [{ required: true, message: "请输入分类名称", trigger: "blur" }]
};

async function fetchData() {
  loading.value = true;
  const { pageNum, pageSize, name } = form;
  try {
    const res = await getCategoryList({ pageNum, pageSize, name });
    if (res.code === 0) {
      // 后端可能返回 records 或 items
      // @ts-ignore
      const list = (res.data.records ?? res.data.items) ?? [];
      dataList.value = list;
      pagination.total = res.data.total ?? list.length;
    }
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  form.name = "";
  fetchData();
}

function handleCurrentChange(page: number) {
  form.pageNum = page;
  pagination.currentPage = page;
  fetchData();
}
function handleSizeChange(size: number) {
  form.pageSize = size;
  pagination.pageSize = size;
  fetchData();
}

function openDialog(row?: any) {
  if (row) {
    dialogTitle.value = "修改分类";
    dialogForm.id = row.id;
    dialogForm.name = row.name;
    dialogForm.description = row.description;
  } else {
    dialogTitle.value = "新增分类";
    dialogForm.id = undefined;
    dialogForm.name = "";
    dialogForm.description = "";
  }
  dialogVisible.value = true;
}

function closeDialog() {
  dialogVisible.value = false;
}

async function handleSaveCategory() {
  await dialogFormRef.value?.validate?.();
  const payload = {
    id: dialogForm.id,
    name: dialogForm.name,
    description: dialogForm.description
  };
  let res;
  if (dialogForm.id) {
    res = await updateCategory(payload);
  } else {
    res = await addCategory(payload);
  }
  if (res.code === 0) {
    message("保存成功", { type: "success" });
    closeDialog();
    fetchData();
  } else {
    message(res.message || "保存失败", { type: "error" });
  }
}

async function handleDelete(row) {
  const res = await deleteCategory(row.id);
  if (res.code === 0) {
    message("删除成功", { type: "success" });
    fetchData();
  }
}

onMounted(fetchData);
</script>

<template>
  <div class="p-4">
    <el-form ref="formRef" :inline="true" :model="form" class="search-form mb-3">
      <el-form-item label="分类名称：" prop="name">
        <el-input v-model="form.name" placeholder="请输入分类名称" clearable class="!w-[180px]" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="useRenderIcon('ri:search-line')" :loading="loading" @click="fetchData">
          搜索
        </el-button>
        <el-button :icon="useRenderIcon(Refresh)" @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>

    <PureTableBar title="分类管理" :columns="columns" @refresh="fetchData">
      <template #buttons>
        <el-button type="primary" :icon="useRenderIcon(AddFill)" @click="openDialog()">
          新增分类
        </el-button>
      </template>
      <template v-slot="{ size, dynamicColumns }">
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
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
        >
          <template #operation="{ row }">
            <el-button link type="primary" :size="size" :icon="useRenderIcon(EditPen)" @click="openDialog(row)">
              修改
            </el-button>
            <el-popconfirm title="是否确认删除?" @confirm="handleDelete(row)">
              <template #reference>
                <el-button link type="primary" :size="size" :icon="useRenderIcon(Delete)">
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </pure-table>
      </template>
    </PureTableBar>

    <!-- 分类新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px" @close="closeDialog">
      <el-form ref="dialogFormRef" :model="dialogForm" :rules="dialogRules" label-width="90px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="dialogForm.name" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="dialogForm.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="handleSaveCategory">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped></style> 