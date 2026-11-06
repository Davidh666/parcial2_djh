import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000', // URL directa para evitar fallos de lectura del .env
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api