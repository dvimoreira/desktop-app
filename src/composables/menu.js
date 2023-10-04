import axios from 'axios'
const API_HOST = 'https://delivery.sejavisto.digital/api/desktop'

const onListMenu = (restaurant_id) => {
    return axios.get(`${API_HOST}/cardapio/list/${restaurant_id}`)
        .then(response => {
            return response
        })
        .catch(error => {
            return error.response
        })
}

const onEdit = (id) => {
    return axios.get(`${API_HOST}/cardapio/edit/${id}`)
        .then(response => {
            return response
        })
        .catch(error => {
            return error.response
        })
}

const onCreate = (data) => {
    return axios.post(`${API_HOST}/cardapio/create`, data)
        .then(response => {
            return response
        })
        .catch(error => {
            return error.response
        })
}

const onUpdate = (data) => {
    return axios.post(`${API_HOST}/cardapio/update`, data)
        .then(response => {
            return response
        })
        .catch(error => {
            return error.response
        })
}

const onDelete = (id) => {
    return  axios.get(`${API_HOST}/cardapio/delete/${id}`)
        .then(response => {
            return response
        })
        .catch(error => {
            return error.response
        })
}

export default {
    onListMenu,
    onEdit,
    onCreate,
    onUpdate,
    onDelete
}