import axios from 'axios'
const API_HOST = 'https://delivery.sejavisto.digital/api/desktop'

const onSyncCode = (data) => {
    return axios.post(`${API_HOST}/auth/login`, data)
        .then(response => {
            return response
        })
        .catch(error => {
            return error.response
        })
}

export default {
    onSyncCode
}