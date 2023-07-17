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
              value-format="yyyy-MM-dd"
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
          <el-form-item label="用车联系人" prop="carLink">
            <el-input
              v-model="queryParams.carLink"
              placeholder="请输入用车联系人"
              clearable
              size="small"
              style="width: 160px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="用车单位" prop="carCustomer">
            <el-input
              v-model="queryParams.carCustomer"
              placeholder="请输入用车单位"
              clearable
              size="small"
              style="width: 160px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="车辆编号" prop="carId">
            <el-input
              v-model="queryParams.carId"
              placeholder="请输入车辆编号"
              clearable
              size="small"
              style="width: 160px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="司机姓名" prop="driverName">
            <el-input
              v-model="queryParams.driverName"
              placeholder="请输入司机姓名"
              clearable
              size="small"
              style="width: 160px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="单位经办人" prop="operatorName">
            <el-input
              v-model="queryParams.operatorName"
              placeholder="请输入单位经办人"
              clearable
              size="small"
              style="width: 160px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="是否结算" prop="isSettle">
            <el-select v-model="queryParams.isSettle" placeholder="请选择" clearable size="small" style="width: 160px">
              <el-option label="是" value="2" />
              <el-option label="否" value="1" />
            </el-select>
          </el-form-item>
          <el-form-item label="是否开票" prop="isInvoicing">
            <el-select v-model="queryParams.isInvoicing" placeholder="请选择" clearable size="small" style="width: 160px">
              <el-option label="是" value="2" />
              <el-option label="否" value="1" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              v-permisaction="['business:travelManage:add']"
              type="primary"
              icon="el-icon-plus"
              size="mini"
              @click="handleAdd"
            >新增行程</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-permisaction="['business:travelManage:export']"
              type="warning"
              icon="el-icon-download"
              size="mini"
              @click="handleExport"
            >导出行程</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-permisaction="['business:flowManage:add']"
              type="success"
              icon="el-icon-edit"
              size="mini"
              :disabled="settlementDisabled"
              @click="handleSettlement"
            >结算</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-permisaction="['business:billManage:add']"
              type="danger"
              icon="el-icon-document-copy"
              size="mini"
              :disabled="openBillDisabled"
              @click="handleOpenBill"
            >开票</el-button>
          </el-col>
        </el-row>

        <el-table v-loading="loading" :data="tableData" border @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="行程编号" prop="tripId" width="180" />
          <el-table-column label="用车联系人" prop="carLink" min-width="100" />
          <el-table-column label="用车单位" prop="carCustomer" min-width="100" />
          <el-table-column label="行程" prop="tripName" min-width="120" />
          <el-table-column label="租车日期" prop="tripDate" min-width="120" />
          <el-table-column label="车辆编号" prop="carId" min-width="100" />
          <el-table-column label="司机姓名" prop="driverName" width="100" />
          <el-table-column label="单位经办人" prop="operatorName" min-width="100" :show-overflow-tooltip="true" />
          <el-table-column label="应付金额(￥)" prop="preMoney" width="100" />
          <el-table-column label="实付金额(￥)" prop="payMoney" width="100" />
          <el-table-column
            label="是否结算"
            prop="isSettle"
            width="80"
            :formatter="(row, column, cellValue, index) => Number(cellValue) === 2 ? '是' : '否'"
          />
          <el-table-column
            label="是否开票"
            prop="isInvoicing"
            width="80"
            :formatter="(row, column, cellValue, index) => Number(cellValue) === 2 ? '是' : '否'"
          />
          <el-table-column label="行程备注" prop="tripMark" min-width="200" :show-overflow-tooltip="true" />

          <el-table-column label="创建时间" prop="createdAt" width="180">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createdAt) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="审核状态"
            prop="tripStatus"
            width="80"
            :formatter="(row, column, cellValue, index) => Number(cellValue) === 1 ? '审核中' : Number(cellValue) === 2? '审核通过': '被驳回'"
          />
          <el-table-column label="操作" align="left" class-name="small-padding fixed-width" width="220">
            <template slot-scope="{row}">
              <template v-if="Number(row.tripStatus) === 1">
                <el-button v-if="checkPermission(['admin'])" size="mini" type="text" @click="handleConfirmTravel(row)">确认行程</el-button>
                <el-link v-else :underline="false" type="warning">正在审核,不允许操作</el-link>
              </template>
              <el-button v-if="Number(row.isSettle) === 1 && Number(row.tripStatus) === 2" v-permisaction="['business:flowManage:add']" size="mini" type="text" @click="handleSettlement(row)">结算</el-button>
              <el-button v-if="Number(row.isInvoicing) === 1 && Number(row.tripStatus) === 2" v-permisaction="['business:billManage:add']" size="mini" type="text" @click="handleOpenBill(row)">开票</el-button>
              <el-button v-if="Number(row.tripStatus) !== 1" v-permisaction="['business:travelManage:edit']" :class="{warn: Number(row.tripStatus) === 3}" size="mini" type="text" @click="handleUpdate(row)">修改</el-button>
              <el-button v-if="checkPermission(['admin'])" v-permisaction="['business:travelManage:delete']" size="mini" type="text" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="table__footer">
          <span>总计应收金额（￥）：{{ totalMoney.money1 }}</span>
          <span>总计实收金额（￥）：{{ totalMoney.money2 }}</span>
          <span>总计未收金额（￥）：{{ totalMoney.money3 }}</span>
        </div>

        <pagination
          v-show="total > 0"
          class="pagination__footer"
          :total="total"
          :page.sync="queryParams.pageIndex"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />

        <!-- 添加或修改行程配置对话框 -->
        <el-dialog v-if="open" :title="title" :visible.sync="open" width="500px" :close-on-click-modal="false">
          <el-form ref="form" class="add__form" :model="form" label-width="100px">
            <el-form-item label="用车联系人" prop="carLink" :rules="[{ required: true, message: '请输入用车联系人' }]">
              <el-input v-model="form.carLink" placeholder="请输入用车联系人" />
            </el-form-item>
            <el-form-item label="用车单位" prop="carCustomer" :rules="[{ required: true, message: '请输入用车单位' }]">
              <el-input v-model="form.carCustomer" placeholder="请输入用车单位" />
            </el-form-item>
            <el-form-item label="行程" prop="tripName" :rules="[{ required: true, message: '请输入行程' }]">
              <el-input v-model="form.tripName" placeholder="请输入行程" />
            </el-form-item>
            <el-form-item label="租车时间" prop="tripDate" :rules="[{ required: true, message: '请输入行程' }]">
              <el-date-picker v-model="form.tripDate" type="date" value-format="yyyy-MM-dd" placeholder="选择日期" />
            </el-form-item>
            <el-form-item label="车辆编号" prop="carId" :rules="[{ required: true, message: '请输入车辆编号' }]">
              <el-input v-model="form.carId" placeholder="请输入车辆编号" />
            </el-form-item>
            <el-form-item label="司机姓名" prop="driverName" :rules="[{ required: true, message: '请输入司机姓名' }]">
              <el-input v-model="form.driverName" placeholder="请输入司机姓名" />
            </el-form-item>
            <el-form-item label="单位经办人" prop="operatorName" :rules="[{ required: true, message: '请输入单位经办人' }]">
              <el-input v-model="form.operatorName" placeholder="请输入单位经办人" />
            </el-form-item>
            <el-form-item label="应付金额" prop="preMoney" :rules="[{ required: true, message: '请输入应付金额(￥)' }]">
              <el-input-number v-model="form.preMoney" controls-position="right" :min="0" />
            </el-form-item>

            <el-form-item label="行程备注" prop="tripMark">
              <el-input v-model="form.tripMark" type="textarea" placeholder="请输入备注" />
            </el-form-item>

            <template v-if="!isEdit">
              <el-form-item label="是否结算" prop="isSettle">
                <el-radio-group v-model="form.isSettle">
                  <el-radio label="2">是</el-radio>
                  <el-radio label="1">否</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item
                v-if="form.isSettle == 2"
                class="sub__form__item"
                label="实付金额"
                prop="payMoney"
                :rules="[{ required: true, message: '请输入实付金额' }]"
              >
                <el-input v-model="form.payMoney" placeholder="请输入实付金额" />
              </el-form-item>

              <el-form-item label="是否开票" prop="isInvoicing">
                <el-radio-group v-model="form.isInvoicing">
                  <el-radio label="2">是</el-radio>
                  <el-radio label="1">否</el-radio>
                </el-radio-group>
              </el-form-item>

              <template v-if="form.isInvoicing == 2">
                <el-form-item
                  class="sub__form__item"
                  label="发票号码"
                  prop="invoiceId"
                  :rules="[{ required: true, message: '请输入发票号码' }]"
                >
                  <el-input v-model="form.invoiceId" placeholder="请输入发票号码" />
                </el-form-item>
                <el-form-item
                  class="sub__form__item"
                  label="发票单位"
                  prop="invoiceCompany"
                  :rules="[{ required: true, message: '请输入发票单位' }]"
                >
                  <el-input v-model="form.invoiceCompany" placeholder="请输入发票单位" />
                </el-form-item>
                <el-form-item
                  class="sub__form__item"
                  label="发票金额"
                  prop="money"
                  :rules="[{ required: true, message: '请输入发票金额(￥)' }]"
                >
                  <el-input v-model="form.money" placeholder="请输入发票金额(￥)" />
                </el-form-item>
                <el-form-item class="sub__form__item" label="发票备注" prop="remark">
                  <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
                </el-form-item>
              </template>
            </template>

            <!-- <el-form-item label="备注">
                <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
              </el-form-item> -->
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitForm">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
          </div>
        </el-dialog>

        <open-bill title="开票" :visible.sync="openBillVisible" :source="selectTravelBillOptions" @reflash="getList" />

        <settle-dialog
          title="结算"
          bill-type="1"
          :visible.sync="settleDialogVisible"
          :source="selectTravelOptions"
          @reflash="getList"
        />

      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import { getTripList, addTrip, updateTrip, delTrip, reviewTrip } from '@/api/business/travel-manage'
import { formatJson } from '@/utils'
import OpenBill from '../components/open-bill.vue'
import SettleDialog from '../components/settle-dialog.vue'
import checkPermission from '@/utils/permission'

export default {
  name: 'TravelManage',
  components: {
    OpenBill,
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
      open: false,
      isEdit: false,
      // 日期范围
      dateRange: [],
      menuOptionsAlert: '加载中，请稍后',
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        carId: '',
        counted: '',
        carLink: '',
        tripId: ''
      },
      tableData: [],
      selectOptions: {
        item: {},
        source: []
      },
      // 表单参数
      form: {},
      openBillVisible: false,
      settleDialogVisible: false,
      totalMoney: {}
    }
  },
  computed: {
    selectTravelOptions() {
      const { selectOptions } = this
      const { item, source } = selectOptions
      if (item.id) {
        const { tripName, tripId } = item
        return [{ tripName, tripId }]
      } else {
        return source.filter(item => item.isSettle === '1')
      }
    },
    selectTravelBillOptions() {
      const { selectOptions } = this
      const { item, source } = selectOptions
      if (item.id) {
        const { tripName, tripId } = item
        return [{ tripName, tripId }]
      } else {
        return source.filter(item => item.isInvoicing === '1')
      }
    },
    settlementDisabled() {
      const { source } = this.selectOptions
      if (!source || !source.length) return true
      const flag = source.some(item => item.isSettle === '1')
      if (!flag) return true
      return false
    },
    openBillDisabled() {
      const { source } = this.selectOptions
      if (!source || !source.length) return true
      const flag = source.some(item => item.isInvoicing === '1')
      if (!flag) return true
      return false
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
      getTripList(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.tableData = response.data.list
          this.total = response.data.count
          this.totalMoney = response.data.totalMoney
          this.loading = false
        }
      )
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.menuOptions = this.menuList
      if (this.$refs.menuTree !== undefined) {
        this.$refs.menuTree.setCheckedKeys([])
      }
      this.form = {
        tripName: '', // 行程名称
        carLink: '', // 车辆联系人
        carId: '', // 车牌照
        driverName: '', // 司机名称
        operatorName: '', // 经办人
        preMoney: '', // 应付金额
        payMoney: '',
        isSettle: '1', // 是否结算，1未结算，2已结算
        isInvoicing: '1' // 是否开票，1未开票，2已开票
      }
      this.resetForm('form')
    },
    reviewTripReq(params, id) {
      reviewTrip(params, id).then(response => {
        if (response.code === 200) {
          this.msgSuccess(response.msg)
          this.getList()
        } else {
          this.msgError(response.msg)
        }
      })
    },

    // 确认行程
    handleConfirmTravel(row) {
      this.$confirm('是否确认该行程?', '警告', {
        confirmButtonText: '通过',
        cancelButtonText: '不通过',
        type: 'warning'
      }).then(() => {
        this.reviewTripReq({ tripStatus: '2' }, row.id)
      }).catch(() => {
        this.reviewTripReq({ tripStatus: '3' }, row.id)
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
      this.selectOptions.source = selection.map(item => {
        const { id, tripName, tripId, isSettle, isInvoicing } = item
        return {
          id,
          tripName,
          tripId,
          isSettle,
          isInvoicing
        }
      })
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
      this.title = '编辑行程'
      this.form = row
      this.isEdit = true
      this.open = true
    },
    // 开票
    handleOpenBill(row) {
      this.selectOptions.item = row
      this.openBillVisible = true
    },
    // 结算
    handleSettlement(row = {}) {
      this.selectOptions.item = row
      this.settleDialogVisible = true
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        const { preMoney } = this.form
        this.form.preMoney = `${preMoney}`
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
            addTrip(this.form).then(response => {
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
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm('确认删除?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delTrip({ 'ids': [row.id] })
      }).then((response) => {
        this.getList()
        this.msgSuccess(response.msg)
      }).catch(function() { })
    },
    buildExportData(data) {
      const flagData = JSON.parse(JSON.stringify(data))
      return flagData.map(item => {
        const { isInvoicing, isSettle, createdAt } = item
        item.isInvoicing = Number(isInvoicing) === 2 ? '是' : '否'
        item.isSettle = Number(isSettle) === 2 ? '是' : '否'
        item.createdAt = this.parseTime(createdAt)
        return item
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.$confirm('是否确认导出所有行程数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.downloadLoading = true
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['行程编号', '用车联系人', '行程', '车辆编号', '司机姓名', '单位经办人', '应付金额(￥)', '实付金额', '是否结算', '是否开票', '创建时间']
          const filterVal = ['tripId', 'carLink', 'tripName', 'carId', 'driverName', 'operatorName', 'preMoney', 'payMoney', 'isSettle', 'isInvoicing', 'createdAt']
          const list = this.buildExportData(this.tableData)
          const data = formatJson(filterVal, list)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: '行程管理',
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

<style lang="scss" scoped>
.add__form {
  .sub__form__item {
    padding-left: 80px;
  }
}

.table__footer {
  font-size: 14px;
  padding-top: 15px;
  span {
    display: inline-block;
    padding-right: 15px;
  }
}

.pagination__footer {
  margin-top: 0;
}

.warn {
  color: #F56C6C;
}
</style>
