import axios from 'axios'
const API_HOST = 'https://delivery.sejavisto.digital/api/desktop'

const onListDeliveryTax = (restaurant_id) => {
    return axios.get(`${API_HOST}/area-entrega/list/${restaurant_id}`)
        .then(response => {
            return response
        })
        .catch(error => {
            return error.response
        })
}

const onEdit = (id) => {
    return axios.get(`${API_HOST}/area-entrega/edit/${id}`)
        .then(response => {
            return response
        })
        .catch(error => {
            return error.response
        })
}

const onCreate = (data) => {
    return axios.post(`${API_HOST}/area-entrega/create`, data)
        .then(response => {
            return response
        })
        .catch(error => {
            return error.response
        })
}

const onUpdate = (data) => {
    return axios.post(`${API_HOST}/area-entrega/update`, data)
        .then(response => {
            return response
        })
        .catch(error => {
            return error.response
        })
}

const onDelete = (id) => {
    return axios.get(`${API_HOST}/area-entrega/delete/${id}`)
        .then(response => {
            return response
        })
        .catch(error => {
            return error.response
        })
}

export default {
    onListDeliveryTax,
    onEdit,
    onCreate,
    onUpdate,
    onDelete
}