<template>
    <div id="page-cardapio">
      <el-button type="success" size="large" @click="openMenu()">Adicionar novo</el-button>

      <el-table :data="data" style="width: 100%; margin-top: 30px;">
          <el-table-column label="Título" prop="title" />

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
      <el-dialog v-model="modal" :title="(action === 'add') ? 'Adicionar Produto' : 'Editar Produto'" destroy-on-close>
          <el-form label-position="top" :model="formMenu" enctype="multipart/form-data">
              <el-form-item label="Título">
                  <el-input placeholder="Informe o título" size="large" v-model="formMenu.title" />
              </el-form-item>

              <el-form-item label="Descrição">
                  <el-input placeholder="Informe a descrição" size="large" v-model="formMenu.description" />
              </el-form-item>

              <el-form-item label="Produto com mais de uma escolha?">
                  <el-switch
                      v-model="formMenu.variable_price"
                      class="ml-2"
                      :active-value="'1'"
                      :inactive-value="'0'"
                      style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                      active-text="Sim"
                      inactive-text="Não"
                  />
              </el-form-item>

              <el-form-item label="Preço" v-if="formMenu.variable_price === '0'">
                  <el-input placeholder="Informe o preço" size="large" v-model="formMenu.price" />
              </el-form-item>

              <el-switch
                  v-model="formMenu.isActive"
                  class="ml-2"
                  :active-value="'1'"
                  :inactive-value="'2'"
                  style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                  active-text="Ativo"
                  inactive-text="Inativo"
              />

              <el-form-item label="Categoria">
                  <!-- <el-select v-model="formMenu.category_id" placeholder="Selecione a categoria" size="large" style="width: 100%;">
                      <el-option
                          v-for="item in categories"
                          :key="item.id"
                          :label="item.title"
                          :value="item.id"
                      />
                  </el-select> -->

                  <el-select v-model="formMenu.category_id" placeholder="Selecione a categoria" size="large" multiple collapse-tags style="width: 100%;">
                      <el-option
                          v-for="item in categories"
                          :key="item.id"
                          :label="item.title"
                          :value="item.id"
                      />
                  </el-select>
              </el-form-item>

              <el-form-item label="Imagem">
                  <input type="file" ref="file" v-on:change="handleFileUpload()">
              </el-form-item>

              <br><br>

              <el-button type="danger" @click="modal = false; action = 'add'">Cancelar</el-button>
              <el-button type="success" @click="onSubmit">Salvar</el-button>
          </el-form>
      </el-dialog>
    </div>
  </template>
    
  <script>
  import { ElLoading, ElMessageBox, ElNotification, UploadProps, UploadUserFile } from 'element-plus'
  import CategoryComposable from '../composables/category'
  import MenuComposable from '../composables/menu'

  export default {
    name: 'CardapioPage',
    data () {
      return {
        restaurant: JSON.parse(localStorage.getItem('restaurant')),
        data: [],
        modal: false,
        action: 'add',
        categories: [],
        file: '',
        formMenu: {
          restaurant_id: '',
          id: '',
          title: '',
          description: '',
          price: '',
          category_id: '',
          isActive: '1',
          image_url: null,
          variable_price: '0'
        }
      }
    },

    mounted () {
      this.formMenu.restaurant_id = this.restaurant.id
      this.onListCategories()
      this.onList()
    },

    methods: {
      handleFileUpload () {
        this.formMenu.image_url = this.file.files[0]
      },

      openMenu () {
        this.modal = true; 
        this.action = 'add'
        this.formMenu.restaurant_id = ''
        this.formMenu.id = ''
        this.formMenu.title = ''
        this.formMenu.description = ''
        this.formMenu.price = ''
        this.formMenu.category_id = ''
        this.formMenu.isActive = ''
        this.formMenu.variable_price = '0'
      },

      async onListCategories () {
        try {
            const result = await CategoryComposable.onListCategories(this.restaurant.id)

            if (result.status === 200) {
                this.categories = result.data.data
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

      async onList () {
        try {
          const result = await MenuComposable.onListMenu(this.restaurant.id)

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

            const formData = new FormData();
            formData.append('restaurant_id', (this.restaurant.id) ? this.restaurant.id : '')
            formData.append('title', (this.formMenu.title) ? this.formMenu.title : '')
            formData.append('description', (this.formMenu.description) ? this.formMenu.description : '')
            formData.append('price', (this.formMenu.price) ? this.formMenu.price : '')
            formData.append('category_id', (this.formMenu.category_id) ? this.formMenu.category_id : '')
            formData.append('image_url', (this.formMenu.image_url) ? this.formMenu.image_url : '')
            formData.append('isActive', (this.formMenu.isActive) ? this.formMenu.isActive : '')
            formData.append('variable_price', (this.formMenu.variable_price) ? this.formMenu.variable_price : '')

            if (this.action === 'add') {
              result = await CategoryComposable.onCreate(formData)
            } else {
              formData.append('id', this.formMenu.id)
              result = await CategoryComposable.onUpdate(formData)
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
          const result = await MenuComposable.onEdit(id)

          if (result.status === 200) {
            this.action = 'edit'
            this.modal = true
            this.formMenu.restaurant_id = result.data.data.id
            this.formMenu.id = result.data.data.id
            this.formMenu.title = result.data.data.title
            this.formMenu.description = result.data.data.description
            this.formMenu.price = result.data.data.price
            this.formMenu.category_id = result.data.data.category_id
            this.formMenu.isActive = result.data.data.isActive
            this.formMenu.variable_price = result.data.data.variable_price

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
            'Tem certeza que deseja deletar esta produto?',
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

            const result = await MenuComposable.onDelete(id)

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