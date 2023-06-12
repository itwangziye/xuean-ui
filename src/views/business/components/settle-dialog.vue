<template>
  <!-- 添加或修改行程配置对话框 -->
  <el-dialog :title="title" :visible.sync="open" width="500px" :close-on-click-modal="false" @close="cancel">
    <el-form ref="form" :model="form" label-width="100px">
      <el-form-item v-if="source && source.length" label="已选行程">
        <div class="travel__tip">已选择{{ source.length }}个行程</div>
        <div class="travel__list">
          <div v-for="(item, index) in source" :key="index" class="travel__item">
            <div class="no">{{ item.tripId }}</div>
            <div class="name">{{ item.tripName }}</div>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="收款对象" prop="billObj" :rules="[{required: true, message: '请输入收款对象'}]">
        <el-input v-model="form.billObj" placeholder="请输入收款对象" />
      </el-form-item>
      <el-form-item label="收款方式" prop="payType" :rules="[{required: true, message: '请输入收款方式'}]">
        <el-select v-model="form.payType" placeholder="请选择收款方式">
          <el-option label="现金" value="1" />
          <el-option label="支付宝" value="2" />
          <el-option label="微信" value="3" />
          <el-option label="对公账户" value="4" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="currentBillType == 1" label="实付金额" prop="income" :rules="[{required: true, message: '请输入实付金额(￥)'}]">
        <el-input v-model="form.income" placeholder="请输入实付金额(￥)" />
      </el-form-item>
      <el-form-item v-else label="实付金额" prop="payOut" :rules="[{required: true, message: '请输入实付金额'}]">
        <el-input v-model="form.payOut" placeholder="请输入实付金额" />
      </el-form-item>
      <el-form-item label="经办人" prop="operatorName" :rules="[{required: true, message: '请输入经办人'}]">
        <el-input v-model="form.operatorName" placeholder="请输入经办人" />
      </el-form-item>
      <el-form-item label="收款备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { addBill, updateBill } from '@/api/business/flow-manage'

export default {
  name: 'SettleDialog',
  props: {
    title: {
      type: String,
      default: ''
    },
    visible: {
      type: Boolean,
      default: false
    },
    source: {
      type: Array,
      default: () => []
    },
    currentItem: {
      type: Object,
      default: () => {}
    },
    billType: {
      type: String,
      default: '2'
    }
  },
  data() {
    return {
      open: false,
      form: {
        billObj: '',
        payType: '1',
        income: '',
        payOut: '',
        operatorName: '',
        remark: ''
      }
    }
  },
  computed: {
    isEdit() {
      const { currentItem } = this
      if (currentItem && currentItem.id) return true
      return false
    },
    currentBillType() {
      const { billType, form } = this
      if (form.billType) return form.billType
      return billType
    }
  },
  watch: {
    visible(newVal) {
      this.open = newVal
      this.setDefaultForm()
    }
  },

  methods: {
    // 取消按钮
    cancel() {
      this.reset()
    },

    // 表单重置
    reset() {
      this.form = {
        billObj: '',
        payType: '1',
        moeny: '',
        operatorName: '',
        remark: ''
      }
      this.resetForm('form')
      this.$emit('update:visible', false)
    },

    getFormParams() {
      const { form, currentBillType } = this
      const params = form
      const trip_id = this.source.map(_ => _.tripId)
      if (trip_id && trip_id.length) {
        params.trip_id = trip_id
      }
      params.billType = currentBillType

      delete params.moeny
      return params
    },

    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          const params = this.getFormParams()
          if (this.isEdit) {
            updateBill(params, params.id).then(response => {
              if (response.code === 200) {
                this.$emit('reflash')
                this.reset()
                this.msgSuccess(response.msg)
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addBill(params).then(response => {
              if (response.code === 200) {
                this.$emit('reflash')
                this.reset()
                this.msgSuccess(response.msg)
              } else {
                this.msgError(response.msg)
              }
            })
          }
        }
      })
    },

    setDefaultForm() {
      const { currentItem } = this
      if (!currentItem || !currentItem.id) return
      const { billObj, payType, income, operatorName, remark, payOut, id, billType } = currentItem
      this.form = {
        billObj,
        payType,
        billType,
        income,
        payOut,
        operatorName,
        remark,
        id
      }
    }
  }
}
</script>

  <style lang="scss" scoped>
    .travel__tip {
    }
    .travel__list {
        border-radius: 4px;
        background: rgba(247, 246, 246, 0.8);
        padding: 8px 17px 0;
        max-height: 100px;
        overflow-y: auto;
        .travel__item {
            display: flex;
            .name {
                padding-left: 20px;
            }
        }
    }
  </style>
