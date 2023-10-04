<template>
    <div id="page-categoria">
      <el-button type="success" size="large" @click="modal = true; action = 'add'; formCategory.title = ''">Adicionar novo</el-button>

      <el-table :data="data" style="width: 100%; margin-top: 30px;">
          <el-table-column label="Título" prop="title" />
          <el-table-column label="Variações" align="center" prop="variations" />

          <el-table-column label="Preço" align="center">
              <template #default="scope">
                  <div v-if="scope.row.price">R$ {{ scope.row.price }}</div>
                  <div v-else>-</div>
              </template>
          </el-table-column>
      
          <el-table-column label="Data de Cadastro" align="center">
              <template #default="scope">
                  {{ new Date(scope.row.created_at).toLocaleDateString() }}
              </template>
          </el-table-column>

          <el-table-column label="Ação" align="center">
              <template #default="scope">
                  <el-button size="small" @click="onEdit(scope.row.id)">Editar</el-button>
                  <el-button size="small" @click="onDelete(scope.row.id)" type="danger">Deletar</el-button>
              </template>
          </el-table-column>
      </el-table>

      <!-- MODAL -->
      <el-dialog v-model="modal" :title="(action === 'add') ? 'Adicionar Categoria' : 'Editar Categoria'" destroy-on-close>
          <el-form label-position="top" :model="formCategory">
              <el-form-item label="Título">
                  <el-input placeholder="Informe o título" size="large" v-model="formCategory.title" />
              </el-form-item>

              <el-form-item label="Variações">
                  <el-input-number v-model="formCategory.variations" :min="0" :max="10" />
                  <small style="display: block; width: 100%;"> Ex: para pizza com 1 sabor ou mais adicione a quantidade de sabores no campo.</small>
              </el-form-item>

              <el-form-item label="Preço" v-if="formCategory.variations > 0">
                  <el-input placeholder="Informe o preço" size="large" v-model="formCategory.price" />
              </el-form-item>

              <el-button type="danger" @click="modal = false; action = 'add'">Cancelar</el-button>
              <el-button type="success" @click="onSubmit">Salvar</el-button>
          </el-form>
      </el-dialog>
    </div>
  </template>
    
  <script>
    import { ElLoading, ElMessageBox, ElNotification } from 'element-plus'
    import CategoryComposable from '../composables/category'
    export default {
      name: 'CategoriaPage',
      data () {
        return {
          restaurant: JSON.parse(localStorage.getItem('restaurant')),
          data: [],
          modal: false,
          action: 'add',
          categories: [],
          file: '',
          formCategory: {
            restaurant_id: '',
            id: null,
            title: '',
            variations: 0,
            price: ''
          }
        }
      },

      mounted () {
        this.formCategory.restaurant_id = this.restaurant.id
        this.onList()
      },

      methods: {
        async onList () {
          try {
            const result = await CategoryComposable.onListCategories(this.restaurant.id)

            if (result.status === 200) {
              this.data = result.data.data
              return 
            } else if (result.status === 422) {
              for (const key in result.data.errors) {
                if (result.data.errors[key]) { 
                  throw Error(result.data.errors[key])
                }
              }
              return
            }

            throw Error(result.data.message)
          } catch (e) {
            ElNotification({
              title: 'Notificação',
              message: e.message,
              type: 'error',
            })
          }
        },

        async onSubmit () {
          const loading = ElLoading.service({
            lock: true,
            text: 'Processando...',
            background: 'rgba(0, 0, 0, 0.7)',
        })

        try {
            let result = null

            if (this.action === 'add') {
              result = await CategoryComposable.onCreate(this.formCategory)
            } else {
              result = await CategoryComposable.onUpdate(this.formCategory)
            }

            if (result.status === 200) {
              ElNotification({
                title: 'Notificação',
                message: result.data.message,
                type: 'success',
              })

              loading.close()
              this.onList()

              this.action = 'add'
              this.modal = false
              return
            } else if (result.status === 422) {
              for (const key in result.data.errors) {
                if (result.data.errors[key]) {
                  throw Error(result.data.errors[key])
                }
              }
              loading.close()
              
              return
            }

            throw Error(result.data.message)
          } catch (e) {
            ElNotification({
              title: 'Notificação',
              message: e.message,
              type: 'error',
            })
          } finally {
            loading.close()
          }
        },

        async onEdit (id) {
          const loading = ElLoading.service({
            lock: true,
            text: 'Processando...',
            background: 'rgba(0, 0, 0, 0.7)',
          })
    
          try {
            const result = await CategoryComposable.onEdit(id)

            if (result.status === 200) {
              this.action = 'edit'
              this.modal = true
              this.formCategory = result.data.data
              loading.close()

              return
            } else if (result.status === 422) {
              for (const key in result.data.errors) {
                if (result.data.errors[key]) {
                  throw Error(result.data.errors[key])
                }
              }
              loading.close()

              return
            }

            throw Error(result.data.message)
          } catch (e) {
            ElNotification({
              title: 'Notificação',
              message: e.message,
              type: 'error',
            })
          } finally {
            loading.close()
          }
        },

        async onDelete (id) {
          try {
            ElMessageBox.confirm(
              'Tem certeza que deseja deletar esta categoria?',
              'Alerta',
              {
                confirmButtonText: 'Confirmar',
                cancelButtonText: 'Cancelar',
                type: 'warning',
              }
            ).then(async () => {
              const loading = ElLoading.service({
                lock: true,
                text: 'Processando...',
                background: 'rgba(0, 0, 0, 0.7)',
              })

              const result = await CategoryComposable.onDelete(id)

              if (result.status === 200) {
                ElNotification({
                  title: 'Notificação',
                  message: result.data.message,
                  type: 'success',
                })

                loading.close()
                this.onList()

                return
              } else if (result.status === 422) {
                for (const key in result.data.errors) {
                  if (result.data.errors[key]) {
                    throw Error(result.data.errors[key])
                  }
                }
                loading.close()
                
                return
              }

              throw Error(result.data.message)
            }).catch(() => {})
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