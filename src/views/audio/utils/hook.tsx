import dayjs from "dayjs";
import { message } from "@/utils/message";
import defaultCover from "@/assets/song.jpg";
import type { PaginationProps } from "@pureadmin/table";
import { getKeyList, deviceDetection } from "@pureadmin/utils";
import {
  getCategoryList,
  getAudioList,
  addAudio,
  updateAudio,
  deleteAudio,
  deleteAudios
} from "@/api/system";
import {
  type Ref,
  ref,
  reactive
} from "vue";

export function useAudio(tableRef: Ref) {
  const form = reactive({
    pageNum: 1,
    pageSize: 10,
    categoryId: null,
    title: ""
  });
  const dataList = ref([]);
  const loading = ref(true);
  const selectedNum = ref(0);
  const categoryOptions = ref<any[]>([]);
  const categoryMap = ref<Record<number, string>>({});
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });
  const columns: TableColumnList = [
    {
      label: "勾选列", // 如果需要表格多选
      type: "selection",
      fixed: "left",
      reserveSelection: true
    },
    { label: "编号", prop: "id", width: 90 },
    {
      label: "封面",
      prop: "cover_url",
      cellRenderer: ({ row }) => (
        <el-image
          fit="cover"
          preview-teleported={true}
          src={row.cover_url || defaultCover}
          preview-src-list={Array.of(row.cover_url)}
          class="w-[72px] h-[72px] rounded-lg align-middle"
        />
      ),
      width: 90
    },
    { label: "标题", prop: "title", minWidth: 150 },
    {
      label: "分类",
      prop: "categoryName",
      minWidth: 130
    },
    {
      label: "上传日期",
      prop: "created_at",
      width: 150,
      formatter: ({ created_at }) => dayjs(created_at).format("YYYY-MM-DD")
    },
    { label: "操作", fixed: "right", width: 180, slot: "operation" }
  ];

  async function fetchCategories() {
    const res = await getCategoryList({ pageNum: 1, pageSize: 100 });
    if (res.code === 0) {
      // @ts-ignore
      categoryOptions.value = res.data.items || res.data.records || [];
      const map = {} as Record<number, string>;
      categoryOptions.value.forEach(c => {
        map[c.id] = c.name;
      });
      categoryMap.value = map;
    }
  }

  async function onSearch() {
    loading.value = true;
    const res = await getAudioList({ ...form });
    if (res.code === 0) {
      // @ts-ignore
      const list = res.data.items || res.data.records || [];
      // 填充分类名称
      list.forEach(item => {
        // 映射分类名称
        if (!item.categoryName && item.categoryId) {
          item.categoryName = categoryMap.value[item.categoryId] || "-";
        }
        // 兼容后端字段命名
        if (!item.audio_url && item.audioUrl) {
          item.audio_url = item.audioUrl;
        }
        if (!item.cover_url && item.coverUrl) {
          item.cover_url = item.coverUrl;
        }
      });
      dataList.value = list;
      pagination.total = res.data.total;
    }
    loading.value = false;
  }

  function resetForm(formRef) {
    form.title = "";
    form.categoryId = null;
    form.pageNum = 1;
    onSearch();
    formRef?.resetFields?.();
  }

  /** 批量删除 */
  function onbatchDel() {
    const curSelected = tableRef.value.getTableRef().getSelectionRows();
    const ids = getKeyList(curSelected, "id");
    deleteAudios(ids).then(res => {
      if (res.code === 0) {
        message(`已删除编号为 ${ids} 的数据`, { type: "success" });
        tableRef.value.getTableRef().clearSelection();
        onSearch();
      }
    });
  }

  /** 当CheckBox选择项发生变化时会触发该事件 */
  function handleSelectionChange(val) {
    selectedNum.value = val.length;
    tableRef.value.setAdaptive();
  }
  function onSelectionCancel() {
    selectedNum.value = 0;
    tableRef.value.getTableRef().clearSelection();
  }

  function handleSizeChange(val: number) {
    pagination.pageSize = val;
    form.pageSize = val;
    onSearch();
  }
  function handleCurrentChange(val: number) {
    pagination.currentPage = val;
    form.pageNum = val;
    onSearch();
  }

  function openDialog(type: string = "新增", row?: any) {
    console.log("openDialog", type, row);
    message(`功能待实现：${type}`, { type: "info" });
  }
  function handleUpdate(row) {
    console.log(row);
  }
  function handleDelete(row) {
    deleteAudio(row.id).then(res => {
      if (res.code === 0) {
        message("删除成功", { type: "success" });
        onSearch();
      }
    });
  }
  function handleUpload(row, isAudio = false) {
    message("功能待实现", { type: "info" });
  }
  function openPreviewDialog(row) {
    window.open(row.audio_url);
  }

  fetchCategories();
  onSearch();

  return {
    form,
    loading,
    columns,
    dataList,
    selectedNum,
    pagination,
    buttonClass: ["!h-[20px]", "reset-margin"],
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
  };
} 