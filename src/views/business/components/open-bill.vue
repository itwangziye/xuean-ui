<template>
     <!-- 添加或修改行程配置对话框 -->
     <el-dialog :title="title" :visible.sync="open" width="500px" :close-on-click-modal="false" @close="cancel">
            <el-form ref="form" :model="form" label-width="100px">
                <el-form-item  label="已选行程" v-if="source && source.length" >
                    <div class="travel__tip">已选择{{source.length}}个行程</div>
                    <div class="travel__list">
                        <div class="travel__item" v-for="(item, index) in source" :key="index">
                            <div class="no">{{ item.tripId}}</div>
                            <div class="name">{{ item.tripName}}</div>
                        </div>
                    </div>
                </el-form-item>
                <el-form-item  label="发票号码" prop="invoiceId" :rules="[{required: true, message: '请输入发票号码'}]" >
                  <el-input v-model="form.invoiceId" placeholder="请输入发票号码"/>
                </el-form-item>
                <el-form-item  label="发票单位" prop="invoiceCompany" :rules="[{required: true, message: '请输入发票单位'}]">
                  <el-input v-model="form.invoiceCompany" placeholder="请输入发票单位"/>
                </el-form-item>
                <el-form-item  label="发票金额(￥)" prop="money" :rules="[{required: true, message: '请输入发票金额(￥)'}]" >
                  <el-input v-model="form.money" placeholder="请输入发票金额(￥)"/>
                </el-form-item>
                <el-form-item  label="备注" prop="remark" >
                  <el-input type="textarea" v-model="form.remark" placeholder="请输入备注"/>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
              <el-button type="primary" @click="submitForm">确 定</el-button>
              <el-button @click="cancel">取 消</el-button>
            </div>
          </el-dialog>
  </template>
  
  <script>
  import {addInvoice } from '@/api/business/bill-manage';
  
  export default {
    name: 'OpenBill',
    props: {
        title: String,
        visible: {
            type: Boolean,
            default: false
        },
        source: {
            type: Array,
            default: () => []
        }
    },
    data() {
      return {
        open: false,
        form: {
            invoiceId: '',
            invoiceCompany: '',
            money: '',
            remark: ''
        }
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
            invoiceId: '',
            invoiceCompany: '',
            money: '',
            remark: ''
        }
        this.resetForm('form');
        this.$emit('update:visible', false);
      },

      /** 提交按钮 */
      submitForm: function() {
        this.$refs['form'].validate(valid => {
          if (valid) {
            const trip_id = this.source.map(_ => _.tripId)
            addInvoice({...this.form, trip_id, invoiceStatus: "1",}).then(response => {
                if (response.code === 200) {
                    this.$emit('reflash')
                    this.reset();
                    this.msgSuccess(response.msg)
                } else {
                    this.msgError(response.msg)
                }
              })
          }
        })
      }
    },
    watch: {
        visible(newVal) {
            this.open = newVal;
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
  