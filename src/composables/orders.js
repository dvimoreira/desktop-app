import axios from 'axios'
const API_HOST = 'https://delivery.sejavisto.digital/api/desktop'

const onList = (restaurant_id) => {
    return axios.get(`${API_HOST}/pedidos/listPedidos/${restaurant_id}`)
        .then(response => {
            return response
        })
        .catch(error => {
            return error.response
        })
}

const onUpdate = (data) => {
    return axios.post(`${API_HOST}/pedidos/listPedidosUpdate`, data)
        .then(response => {
            return response
        })
        .catch(error => {
            return error.response
        })
}

export default {
    onList,
    onUpdate
}