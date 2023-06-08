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
                v-model="queryParams.roleKey"
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
              <el-select
                v-model="queryParams.isSettle"
                placeholder="请选择"
                clearable
                size="small"
                style="width: 160px"
              >
                <el-option label="是" value="2"/>
                <el-option label="否" value="1"/>
              </el-select>
            </el-form-item>
            <el-form-item label="是否开票" prop="isInvoicing">
              <el-select
                v-model="queryParams.isInvoicing"
                placeholder="请选择"
                clearable
                size="small"
                style="width: 160px"
              >
                <el-option label="是" value="2"/>
                <el-option label="否" value="1"/>
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
              >导出行程</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button
                v-permisaction="['admin:sysRole:update']"
                type="success"
                icon="el-icon-edit"
                size="mini"
                @click="handleSettlement"
              >结算</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button
                v-permisaction="['admin:sysRole:remove']"
                type="danger"
                icon="el-icon-document-copy"
                size="mini"
                @click="handleOpenBill"
              >开票</el-button>
            </el-col>
            
          </el-row>
  
          <el-table
            v-loading="loading"
            :data="tableData"
            border
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="行程编号"  prop="tripId" width="180" />
            <el-table-column label="用车联系人"  prop="carLink" min-width="100" :show-overflow-tooltip="true" />
            <el-table-column label="行程"  prop="tripName" min-width="120" />
            <el-table-column label="车辆编号"  prop="carId" min-width="80" />
            <el-table-column label="司机姓名"  prop="driverName" width="100" />
            <el-table-column label="单位经办人"  prop="operatorName" min-width="100" :show-overflow-tooltip="true" />
            <el-table-column label="应付金额(￥)"  prop="preMoney" width="100" />
            <el-table-column label="实付金额(￥)"  prop="payMoney" width="100" />
            <el-table-column label="是否结算"  prop="isSettle" width="80" :formatter="(row, column, cellValue, index) => cellValue == 2 ? '是': '否'" />
            <el-table-column label="是否开票"  prop="isInvoicing" width="80"  :formatter="(row, column, cellValue, index) => cellValue == 2 ? '是': '否'"/>
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
              <template slot-scope="{row}">
                <el-button
                  v-if="row.isSettle == 1"
                  v-permisaction="['admin:sysRole:update']"
                  size="mini"
                  type="text"
                  @click="handleSettlement(row)"
                >结算</el-button>
                <el-button
                v-if="row.isInvoicing == 1"
                  v-permisaction="['admin:sysRole:update']"
                  size="mini"
                  type="text"
                  @click="handleOpenBill(row)"
                >开票</el-button>
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
  
          <!-- 添加或修改行程配置对话框 -->
          <el-dialog v-if="open" :title="title" :visible.sync="open" width="500px" :close-on-click-modal="false">
            <el-form class="add__form" ref="form" :model="form" label-width="100px">
              <el-form-item label="用车联系人" prop="carLink" :rules="[{required: true, message: '请输入用车联系人'}]">
                <el-input v-model="form.carLink" placeholder="请输入用车联系人"/>
              </el-form-item>
              <el-form-item label="行程" prop="tripName" :rules="[{required: true, message: '请输入行程'}]">
                <el-input v-model="form.tripName" placeholder="请输入行程"/>
              </el-form-item>
              <el-form-item label="车辆编号" prop="carId" :rules="[{required: true, message: '请输入车辆编号'}]">
                <el-input v-model="form.carId" placeholder="请输入车辆编号"/>
              </el-form-item>
              <el-form-item label="司机姓名" prop="driverName" :rules="[{required: true, message: '请输入司机姓名'}]">
                <el-input v-model="form.driverName" placeholder="请输入司机姓名"/>
              </el-form-item>
              <el-form-item label="单位经办人" prop="operatorName" :rules="[{required: true, message: '请输入单位经办人'}]">
                <el-input v-model="form.operatorName" placeholder="请输入单位经办人"/>
              </el-form-item>
              <el-form-item label="应付金额(￥)" prop="preMoney" :rules="[{required: true, message: '请输入应付金额(￥)'}]">
                <el-input-number v-model="form.preMoney" controls-position="right" :min="0" />
              </el-form-item>
              <el-form-item label="是否结算" prop="isSettle">
                <el-radio-group v-model="form.isSettle">
                  <el-radio label="2">是</el-radio>
                  <el-radio label="1">否</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item class="sub__form__item" label="实付金额" prop="payMoney" :rules="[{required: true, message: '请输入实付金额'}]" v-if="form.isSettle == 2">
                <el-input v-model="form.payMoney" placeholder="请输入实付金额"/>
              </el-form-item>

              <el-form-item label="是否开票" prop="isInvoicing">
                <el-radio-group v-model="form.isInvoicing">
                  <el-radio label="2">是</el-radio>
                  <el-radio label="1" >否</el-radio>
                </el-radio-group>
              </el-form-item>

              <template v-if="form.isInvoicing == 2">
                <el-form-item class="sub__form__item" label="发票号码" prop="invoiceId" :rules="[{required: true, message: '请输入发票号码'}]" >
                  <el-input v-model="form.invoiceId" placeholder="请输入发票号码"/>
                </el-form-item>
                <el-form-item class="sub__form__item" label="发票单位" prop="invoiceCompany" :rules="[{required: true, message: '请输入发票单位'}]">
                  <el-input v-model="form.invoiceCompany" placeholder="请输入发票单位"/>
                </el-form-item>
                <el-form-item class="sub__form__item" label="发票金额(￥)" prop="money" :rules="[{required: true, message: '请输入发票金额(￥)'}]" >
                  <el-input v-model="form.money" placeholder="请输入发票金额(￥)"/>
                </el-form-item>
                <el-form-item class="sub__form__item" label="备注" prop="remark" >
                  <el-input type="textarea" v-model="form.remark" placeholder="请输入备注"/>
                </el-form-item>
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


          <open-bill title="开票" :visible.sync="openBillVisible" :source="selectTravelOptions" @reflash="getList"/>

          <settle-dialog title="结算" :visible.sync="settleDialogVisible" :source="selectTravelOptions" @reflash="getList"/>



        </el-card>
      </template>
    </BasicLayout>
  </template>
  
  <script>
  import { getTripList, addTrip, updateTrip, delTrip } from '@/api/business/travel-manage'
  import { formatJson } from '@/utils';
  import OpenBill from '../components/open-bill.vue';
  import SettleDialog from '../components/settle-dialog.vue';

  
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
          tripId: '',
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
      }
    },
    computed: {
      selectTravelOptions() {
        const {selectOptions} = this;
        const {item, source} = selectOptions;
        if (item.id) {
          const {tripName, tripId} = item;
          return [{tripName, tripId}]
        } else {
          return source
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
        getTripList(this.addDateRange(this.queryParams, this.dateRange)).then(
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
        this.selectOptions.source = selection.map(item => {
          const {id, tripName, tripId} = item;
          return {
            id, 
            tripName, 
            tripId
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
        this.title = '编辑行程';
        this.form = row;
        this.isEdit = true;
        this.open = true
      },
      // 开票
      handleOpenBill(row) {
        this.selectOptions.item = row;
        this.openBillVisible = true;
      },
      // 结算
      handleSettlement(row = {}) {
        this.selectOptions.item = row;
        this.settleDialogVisible = true;
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
  