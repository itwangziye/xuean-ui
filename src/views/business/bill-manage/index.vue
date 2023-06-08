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
              >
            </el-date-picker>
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
              v-permisaction="['admin:sysRole:add']"
              type="primary"
              icon="el-icon-plus"
              size="mini"
              @click="handleAdd"
            >新增行程</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-permisaction="['admin:sysRole:export']"
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
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="编号"  prop="id" width="50" />
          <el-table-column label="发票号码"  prop="invoiceId" min-width="180" :show-overflow-tooltip="true" />
          <el-table-column label="关联行程"  prop="tripId" min-width="180" />
          <el-table-column label="发票单位"  prop="invoiceCompany" min-width="180" />
          <el-table-column label="发票金额(￥)"  prop="money" width="100" />
          <el-table-column label="发票备注"  prop="remark" min-width="100" :show-overflow-tooltip="true" />
          <el-table-column label="创建时间"  prop="createdAt" width="180">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createdAt) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="left"
            class-name="small-padding fixed-width"
            width="220"
          >
            <template slot-scope="scope">
              <el-button
                v-permisaction="['admin:sysRole:update']"
                size="mini"
                type="text"
                @click="handleUpdate(scope.row)"
              >修改</el-button>
             
              <el-button
                v-permisaction="['admin:sysRole:remove']"
                size="mini"
                type="text"
                @click="handleDelete(scope.row)"
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
    </template>

    <open-bill title="开票" :visible.sync="openBillVisible" @reflash="getList"/>

  </BasicLayout>
</template>

<script>
import { getInvoiceList, addInvoice, delInvoice } from '@/api/business/bill-manage'
import { formatJson } from '@/utils'
import OpenBill from '../components/open-bill.vue';

export default {
  name: 'BillManage',
  components: {
    OpenBill
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
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
      openBillVisible: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
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
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 取消按钮（数据权限）
    cancelDataScope() {
      this.reset()
    },
    // 表单重置
    reset() {
      this.menuOptions = this.menuList
      if (this.$refs.menuTree !== undefined) {
        this.$refs.menuTree.setCheckedKeys([])
      }
      this.form = {
        tripName: "", // 行程名称
        carLink: "", //车辆联系人
        carId: "", // 车牌照
        driverName: "", // 司机名称
        operatorName: "", // 经办人
        preMoney: "", // 应付金额
        payMoney: "",
        isSettle: "1", // 是否结算，1未结算，2已结算
        isInvoicing: "1", // 是否开票，1未开票，2已开票
      }
      this.resetForm('form')
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
      this.ids = selection.map(item => item.roleId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      // this.getMenuTreeselect(0)
      this.open = true
      this.title = '添加行程'
      this.isEdit = false
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.title = '编辑行程';
      this.form = row;
      this.isEdit = true;
      this.open = true
    },

    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        const {preMoney} = this.form;
        this.form.preMoney =  `${preMoney}`;
        if (valid) {
          if (this.form.id !== undefined) {
            updateTrip(this.form, this.form.id).then(response => {
              if (response.code === 200) {
                this.msgSuccess(response.msg)
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addInvoice(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess(response.msg)
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          }
        }
      })
    },
    /** 提交按钮（数据权限） */
    submitDataScope: function() {
      if (this.form.roleId !== undefined) {
        this.form.deptIds = this.getDeptAllCheckedKeys()
        console.log(this.getDeptAllCheckedKeys())
        dataScope(this.form).then(response => {
          if (response.code === 200) {
            this.msgSuccess(response.msg)
            this.getList()
          } else {
            this.msgError(response.msg)
          }
        })
      }
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const roleIds = (row.roleId && [row.roleId]) || this.ids
      this.$confirm('是否确认删除角色编号为"' + roleIds + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delRole({ 'ids': roleIds })
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
