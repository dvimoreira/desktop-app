import axios from 'axios'
const API_HOST = 'https://delivery.sejavisto.digital/api/desktop'

const checkOnline = (id) => {
    return axios.get(`${API_HOST}/restaurant/checkOnline/${id}`)
        .then(response => {
            return response
        })
        .catch(error => {
            return error.response
        })
}

const updateStatus = (data) => {
    return axios.post(`${API_HOST}/restaurant/updateOnline`, data)
        .then(response => {
            return response
        })
        .catch(error => {
            return error.response
        })
}

export default {checkOnline, updateStatus}