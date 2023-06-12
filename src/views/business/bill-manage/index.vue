<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-form ref="queryForm" :model="queryParams" :inline="true">
          <el-form-item label="指定日期" prop="dateRange">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="yyyy-MM-dd"
              size="small"
            />
          </el-form-item>
          <el-form-item label="发票号码" prop="invoiceId">
            <el-input
              v-model="queryParams.invoiceId"
              placeholder="请输入发票号码"
              clearable
              size="small"
              style="width: 160px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="行程编号" prop="tripId">
            <el-input
              v-model="queryParams.tripId"
              placeholder="请输入行程编号"
              clearable
              size="small"
              style="width: 160px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="发票单位" prop="invoiceCompany">
            <el-input
              v-model="queryParams.invoiceCompany"
              placeholder="请输入发票单位"
              clearable
              size="small"
              style="width: 160px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="发票备注" prop="remark">
            <el-input
              v-model="queryParams.remark"
              placeholder="请输入发票备注"
              clearable
              size="small"
              style="width: 160px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              v-permisaction="['business:billManage:add']"
              type="primary"
              icon="el-icon-plus"
              size="mini"
              @click="handleAdd"
            >新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-permisaction="['business:billManage:export']"
              type="warning"
              icon="el-icon-download"
              size="mini"
              @click="handleExport"
            >导出记录</el-button>
          </el-col>
        </el-row>

        <el-table
          v-loading="loading"
          :data="tableData"
          border
          @selection-change="handleSelectionChange"
        >
          <!-- <el-table-column type="selection" width="55" align="center" /> -->
          <el-table-column label="编号" prop="id" width="50" />
          <el-table-column label="发票号码" prop="invoiceId" min-width="180" />
          <el-table-column label="关联行程" prop="tripId" min-width="180" />
          <el-table-column label="发票单位" prop="invoiceCompany" min-width="180" />
          <el-table-column label="发票金额(￥)" prop="money" width="100" />
          <el-table-column label="发票备注" prop="remark" min-width="200" :show-overflow-tooltip="true" />
          <el-table-column label="创建时间" prop="createdAt" width="180">
            <template slot-scope="{row}">
              <span>{{ parseTime(row.createdAt) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="left"
            class-name="small-padding fixed-width"
            width="220"
          >
            <template slot-scope="{row}">
              <el-button v-if="row.invoiceStatus == 1" v-permission="['admin']" size="mini" type="text" @click="handleConfirmBill(row)">确认发票</el-button>
              <el-button
                v-if="checkPermission(['admin']) && Number(row.billStatus) === 1 || Number(row.invoiceStatus) === 3"
                v-permisaction="['business:billManage:edit']"
                size="mini"
                type="text"
                @click="handleUpdate(row)"
              >修改</el-button>

              <el-button
                v-if="checkPermission(['admin'])"
                v-permisaction="['business:billManage:delete']"
                size="mini"
                type="text"
                @click="handleDelete(row)"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="total>0"
          :total="total"
          :page.sync="queryParams.pageIndex"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />
      </el-card>

      <open-bill :current-item="currentRow" title="开票" :visible.sync="openBillVisible" @reflash="getList" />

    </template>
  </BasicLayout>
</template>

<script>
import { getInvoiceList, delInvoice, reviewInvoice } from '@/api/business/bill-manage'
import { formatJson } from '@/utils'
import OpenBill from '../components/open-bill.vue'
import checkPermission from '@/utils/permission'

export default {
  name: 'BillManage',
  components: {
    OpenBill
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      openBillVisible: false,
      isEdit: false,
      // 日期范围
      dateRange: [],
      menuOptionsAlert: '加载中，请稍后',
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        invoiceId: '',
        tripId: '',
        invoiceCompany: '',
        remark: ''
      },
      tableData: [],
      // 表单参数
      form: {},
      currentRow: {}
    }
  },
  created() {
    this.getList()
  },
  methods: {
    checkPermission(params) {
      return checkPermission(params)
    },
    /** 查询角色列表 */
    getList() {
      this.loading = true
      getInvoiceList(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.tableData = response.data.list
          this.total = response.data.count
          this.loading = false
        }
      )
    },
    reviewInvoiceReq(params, id) {
      reviewInvoice(params, id).then(response => {
        if (response.code === 200) {
          this.msgSuccess(response.msg)
          this.getList()
        } else {
          this.msgError(response.msg)
        }
      })
    },
    handleConfirmBill(row) {
      this.$confirm('是否确认该发票?', '警告', {
        confirmButtonText: '通过',
        cancelButtonText: '不通过',
        type: 'warning'
      }).then(() => {
        this.reviewInvoiceReq({ invoiceStatus: '2' }, row.id)
      }).catch(() => {
        this.reviewInvoiceReq({ invoiceStatus: '3' }, row.id)
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageIndex = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = []
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      // this.ids = selection.map(item => item.roleId)
    },
    /** 新增按钮操作 */
    handleAdd() {
      // this.getMenuTreeselect(0)
      this.currentRow = {}
      this.openBillVisible = true
      this.title = '添加行程'
      this.isEdit = false
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.title = '编辑行程'
      this.currentRow = row
      this.isEdit = true
      this.openBillVisible = true
    },

    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm('确定删除？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delInvoice({ ids: [row.id] })
      }).then((response) => {
        this.getList()
        this.msgSuccess(response.msg)
      }).catch(function() {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.$confirm('是否确认导出所有发票?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.downloadLoading = true
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['发票号码', '关联行程', '发票单位', '发票金额（￥）', '发票备注', '创建时间']
          const filterVal = ['invoiceId', 'tripId', 'invoiceCompany', 'money', 'remark', 'createdAt']
          const list = this.tableData
          const data = formatJson(filterVal, list)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: '发票管理',
            autoWidth: true, // Optional
            bookType: 'xlsx' // Optional
          })
          this.downloadLoading = false
        })
      })
    }
  }
}
</script>

<style lang="scss">
.add__form {
  .sub__form__item {
    padding-left: 80px;
  }
}

</style>
