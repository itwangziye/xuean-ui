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
              size="small"
            />
          </el-form-item>
          <el-form-item label="流水编号" prop="billId">
            <el-input
              v-model="queryParams.billId"
              placeholder="请输入发流水编号"
              clearable
              size="small"
              style="width: 160px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="流水类型" prop="billType">
            <el-select
              v-model="queryParams.billType"
              placeholder="请选择流水类型"
              clearable
              size="small"
              style="width: 160px"
            >
              <el-option label="全部" value="" />
              <el-option label="车费结算" value="1" />
              <el-option label="反差" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="交易对象" prop="billObj">
            <el-input
              v-model="queryParams.billObj"
              placeholder="请输入交易对象"
              clearable
              size="small"
              style="width: 160px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="行程编号" prop="tripId">
            <el-input
              v-model="queryParams.tripId"
              placeholder="请输入发票单位"
              clearable
              size="small"
              style="width: 160px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="交易方式" prop="payType">
            <el-select
              v-model="queryParams.payType"
              placeholder="请选择交易方式"
              clearable
              size="small"
              style="width: 160px"
            >
              <el-option label="全部" value="" />
              <el-option label="现金" value="1" />
              <el-option label="支付宝" value="2" />
              <el-option label="微信" value="3" />
              <el-option label="对公账户" value="4" />
            </el-select>
          </el-form-item>
          <el-form-item label="经办人" prop="operatorName">
            <el-input
              v-model="queryParams.operatorName"
              placeholder="请输入经办人"
              clearable
              size="small"
              style="width: 160px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>

          <el-form-item label="流水备注" prop="remark">
            <el-input
              v-model="queryParams.remark"
              placeholder="请输入流水备注"
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
              v-permisaction="['admin:sysRole:add']"
              type="primary"
              icon="el-icon-plus"
              size="mini"
              @click="handleAdd"
            >新增反差</el-button>
          </el-col>
          <!-- <el-col :span="1.5">
            <el-button
              v-permisaction="['admin:sysRole:export']"
              type="warning"
              icon="el-icon-download"
              size="mini"
              @click="handleExport"
            >导出记录</el-button>
          </el-col> -->
        </el-row>

        <el-table
          v-loading="loading"
          :data="tableData"
          border
          @selection-change="handleSelectionChange"
        >
          <el-table-column label="流水编号" prop="billId" min-width="180" :show-overflow-tooltip="true" />
          <el-table-column label="流水类型" prop="billType" width="100" :formatter="(row, column, cellValue, index) => cellValue == 1 ? '车费结算': '返差'" />
          <el-table-column label="交易对象" prop="billObj" min-width="180" />
          <el-table-column label="关联行程" prop="tripId" min-width="200" />
          <el-table-column label="交易方式" prop="payType" width="100" :formatter="(row, column, cellValue, index) => payTypeMap[cellValue]" />
          <el-table-column label="收入（￥）" prop="income" width="100" />
          <el-table-column label="支出（￥）" prop="payOut" width="100" />
          <el-table-column label="经办人" prop="operatorName" width="100" />
          <el-table-column label="流水备注" prop="remark" min-width="200" />
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
              <el-button v-if="row.billStatus == 1" v-permission="['admin']" size="mini" type="text" @click="handleConfirmFlow(row)">确认流水</el-button>
              <el-button
                v-permisaction="['admin:sysRole:update']"
                size="mini"
                type="text"
                @click="handleUpdate(row)"
              >修改</el-button>

              <el-button
                v-permisaction="['admin:sysRole:remove']"
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

      <settle-dialog title="结算" :visible.sync="settleDialogVisible" :current-item="currentRow" @reflash="getList" />

    </template>
  </BasicLayout>
</template>

<script>
import { getBillList, delBill, reviewBill } from '@/api/business/flow-manage'
import { formatJson } from '@/utils'
import SettleDialog from '../components/settle-dialog.vue'

export default {
  name: 'FlowManage',
  components: {
    SettleDialog
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
      settleDialogVisible: false,
      isEdit: false,
      // 日期范围
      dateRange: [],
      menuOptionsAlert: '加载中，请稍后',
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        billId: '',
        billType: '',
        tripId: '',
        payType: '',
        billObj: '',
        operatorName: '',
        remark: ''
      },
      tableData: [],
      // 表单参数
      form: {},
      currentRow: {}
    }
  },
  computed: {
    payTypeMap() {
      return {
        1: '现金',
        2: '支付宝',
        3: '微信',
        4: '对公账户'
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询角色列表 */
    getList() {
      this.loading = true
      getBillList(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.tableData = response.data.list
          this.total = response.data.count
          this.loading = false
        }
      )
    },
    reviewFlowReq(params, id) {
      reviewBill(params, id).then(response => {
        if (response.code === 200) {
          this.msgSuccess(response.msg)
          this.getList()
        } else {
          this.msgError(response.msg)
        }
      })
    },
    // 确认行程
    handleConfirmFlow(row) {
      this.$confirm('是否确认该流水?', '警告', {
        confirmButtonText: '通过',
        cancelButtonText: '不通过',
        type: 'warning'
      }).then(() => {
        this.reviewFlowReq({ billStatus: '2' }, row.id)
      }).catch(function() {
        this.reviewFlowReq({ billStatus: '3' }, row.id)
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
      this.settleDialogVisible = true
      this.title = '结算'
      this.isEdit = false
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.title = '编辑行程'
      this.currentRow = row
      this.isEdit = true
      this.settleDialogVisible = true
    },

    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm('确定删除？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delBill({ ids: [row.id] })
      }).then((response) => {
        this.getList()
        this.msgSuccess(response.msg)
      }).catch(function() {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.$confirm('是否确认导出所有角色数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.downloadLoading = true
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['角色编号', '角色名称', '权限字符', '显示顺序', '状态', '创建时间']
          const filterVal = ['roleId', 'roleName', 'roleKey', 'roleSort', 'status', 'createdAt']
          const list = this.tableData
          const data = formatJson(filterVal, list)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: '角色管理',
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
