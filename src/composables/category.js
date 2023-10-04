import axios from 'axios'
const API_HOST = 'https://delivery.sejavisto.digital/api/desktop'

const onListCategories = (restaurant_id) => {
    return axios.get(`${API_HOST}/categorias/list/${restaurant_id}`)
        .then(response => {
            return response
        })
        .catch(error => {
            return error.response
        })
}

const onEdit = (id) => {
    return axios.get(`${API_HOST}/categorias/edit/${id}`)
        .then(response => {
            return response
        })
        .catch(error => {
            return error.response
        })
}

const onCreate = (data) => {
    return axios.post(`${API_HOST}/categorias/create`, data)
        .then(response => {
            return response
        })
        .catch(error => {
            return error.response
        })
}

const onUpdate = (data) => {
    return axios.post(`${API_HOST}/categorias/update`, data)
        .then(response => {
            return response
        })
        .catch(error => {
            return error.response
        })
}

const onDelete = (id) => {
    return axios.get(`${API_HOST}/categorias/delete/${id}`)
        .then(response => {
            return response
        })
        .catch(error => {
            return error.response
        })
}

export default {
    onListCategories,
    onEdit,
    onCreate,
    onUpdate,
    onDelete
}