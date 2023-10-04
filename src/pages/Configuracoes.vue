<template>
  <div id="page-configuracoes">
      <el-tabs v-model="activeName">
        <el-tab-pane label="Impressora" name="first">
            <el-form label-position="top" :model="formSync">
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="Selecione uma impressora">
                            <el-select v-model="formSync.printSelected" placeholder="Selecione" size="large" style="width: 100%;">
                                <el-option
                                    v-for="(item, key) in printersList"
                                    :key="key"
                                    :label="item"
                                    :value="item"
                                />
                            </el-select>
                        </el-form-item>
                    </el-col>

                    <el-col :span="12">
                        <el-form-item label="Largura de impressão">
                            <el-input-number style="width: 100%;" controls-position="right" placeholder="Informe a largura" size="large" v-model="formSync.printSize" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-button color="#8435A4" size="large" @click="onSubmit" :disabled="!formSync.printSize || !formSync.printSelected">Salvar</el-button>
            </el-form>
        </el-tab-pane>
        <el-tab-pane label="Recebimentos" name="second">Recebimentos</el-tab-pane>
    </el-tabs>
  </div>
  </template>
    
  <script>
    import { ElNotification } from 'element-plus'
    import { useIpcRenderer } from '@vueuse/electron'
    export default {
      name: 'ConfiguracoesPage',
      data () {
        return {
          printersList: {},
          formSync: {
            printSelected: '',
            printSize: 58
          },
          activeName: 'first'
        }
      },

      mounted () {
        this.getPrinters()
      },

      methods: {
        async getPrinters () {
          try {
            const ipcRenderer = useIpcRenderer()
            let result = await ipcRenderer.invoke('get-printers-list')
            console.log(result)
            this.printersList = result.printers
          } catch (e) {
            ElNotification({
              title: 'Notificação',
              message: e.message,
              type: 'error',
            })
          }
        },

        async onSubmit () {
          try {
            let data = {
              impressora: this.formSync.printSelected.replace(/^\s+/g, ''),
              largura: this.formSync.printSize
            }

            localStorage.setItem('impressora_selecionada', JSON.stringify(data))

            ElNotification({
              title: 'Notificação',
              message: 'Impressora salva com sucesso!', 
              type: 'success',
            })
          } catch (e) {
            ElNotification({
              title: 'Notificação',
              message: e.message, 
              type: 'error',
            })
          }
        }
      }
    }
  </script>