<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/plugins/axios'

interface Recinto {
  id: number
  nombre: string
  ciudad: string
}

interface EventoCultural {
  id: number
  titulo: string
  artista_principal: string
  duracion_minutos: number
  precio_entrada: number
  fecha_evento: string
  estado: string
  categoria_eventos: string
  id_recinto?: number
}

const eventos = ref<EventoCultural[]>([])
const recintos = ref<Recinto[]>([])
const cargando = ref(true)
const error = ref('')

const form = ref({
  titulo: '',
  artista_principal: '',
  duracion_minutos: 0,
  precio_entrada: 0,
  fecha_evento: '',
  estado: 'Programado',
  categoria_eventos: 'concierto',
  id_recinto: 1 
})

const cargarDatos = async () => {
  cargando.value = true
  error.value = ''

  try {
    const resRecintos = await api.get('/recintos')
    let dataRec = resRecintos.data
    if (typeof dataRec === 'string') dataRec = JSON.parse(dataRec)
    recintos.value = Array.isArray(dataRec) ? dataRec : (dataRec.data || [])
  } catch (err) {
    console.error('Error al cargar recintos:', err)
  }

  try {
    const resEventos = await api.get('/evento-cultural')
    let dataEv = resEventos.data
    if (typeof dataEv === 'string') dataEv = JSON.parse(dataEv)
    eventos.value = Array.isArray(dataEv) ? dataEv : (dataEv.data || [])
  } catch (err) {
    console.error('Error al cargar eventos:', err)
    error.value = 'No se pudieron cargar los eventos culturales del servidor.'
  } finally {
    cargando.value = false
  }
}

const registrarEvento = async () => {
  try {
    const payload = {
      ...form.value,
      id_recinto: form.value.id_recinto ? Number(form.value.id_recinto) : 1
    }

    await api.post('/evento-cultural', payload)
    alert('¡Evento cultural registrado con éxito!')
    form.value = {
      titulo: '',
      artista_principal: '',
      duracion_minutos: 0,
      precio_entrada: 0,
      fecha_evento: '',
      estado: 'Programado',
      categoria_eventos: 'concierto',
      id_recinto: 1
    }
    cargarDatos()
  } catch (err: any) {
    console.error('Error detallado:', err.response?.data)
    const mensajeBackend = err.response?.data?.message || err.message
    alert('Error del servidor: ' + JSON.stringify(mensajeBackend))
  }
}

onMounted(() => {
  cargarDatos()
})
</script>

<template>
  <div class="container" style="padding: 20px; color: #fff;">
    <h2>Gestión de Eventos Culturales</h2>

    <form @submit.prevent="registrarEvento" style="background: #1e1e1e; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
      <h3>Registrar Nuevo Evento</h3>
      
      <div style="margin-bottom: 10px;">
        <label>Título:</label><br>
        <input v-model="form.titulo" type="text" required style="width: 100%; padding: 8px;" placeholder="Ej. Concierto de Gala" />
      </div>

      <div style="margin-bottom: 10px;">
        <label>Artista Principal:</label><br>
        <input v-model="form.artista_principal" type="text" required style="width: 100%; padding: 8px;" />
      </div>

      <div style="margin-bottom: 10px;">
        <label>Duración (minutos):</label><br>
        <input v-model.number="form.duracion_minutos" type="number" required style="width: 100%; padding: 8px;" />
      </div>

      <div style="margin-bottom: 10px;">
        <label>Precio de Entrada:</label><br>
        <input v-model.number="form.precio_entrada" type="number" step="0.01" required style="width: 100%; padding: 8px;" />
      </div>

      <div style="margin-bottom: 10px;">
        <label>Fecha del Evento:</label><br>
        <input v-model="form.fecha_evento" type="date" required style="width: 100%; padding: 8px;" />
      </div>

      <div style="margin-bottom: 10px;" v-if="recintos.length > 0">
        <label>Recinto:</label><br>
        <select v-model.number="form.id_recinto" required style="width: 100%; padding: 8px;">
          <option v-for="recinto in recintos" :key="recinto.id" :value="recinto.id">
            {{ recinto.nombre }} ({{ recinto.ciudad }})
          </option>
        </select>
      </div>

      <div style="margin-bottom: 10px;">
        <label>Categoría del Evento:</label><br>
        <select v-model="form.categoria_eventos" required style="width: 100%; padding: 8px;">
          <option value="concierto">Concierto</option>
          <option value="teatro">Teatro</option>
          <option value="danza">Danza</option>
          <option value="festival">Festival</option>
        </select>
      </div>

      <div style="margin-bottom: 15px;">
        <label>Estado:</label><br>
        <select v-model="form.estado" required style="width: 100%; padding: 8px;">
          <option value="Programado">Programado</option>
          <option value="Agotado">Agotado</option>
          <option value="Cancelado">Cancelado</option>
        </select>
      </div>

      <button type="submit" style="background: #42b883; color: white; padding: 10px 15px; border: none; cursor: pointer; border-radius: 4px;">Guardar Evento</button>
    </form>

    <h3>Lista de Eventos Registrados</h3>
    <div v-if="cargando">Cargando datos...</div>
    <div v-else-if="error" style="color: #ff6b6b;">{{ error }}</div>

    <table v-else border="1" cellpadding="10" style="width: 100%; border-collapse: collapse; margin-top: 15px;">
      <thead>
        <tr style="background-color: #222; color: white;">
          <th>ID</th>
          <th>Título</th>
          <th>Artista</th>
          <th>Categoría</th>
          <th>Duración</th>
          <th>Precio</th>
          <th>Fecha</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="evento in eventos" :key="evento.id">
          <td>{{ evento.id }}</td>
          <td>{{ evento.titulo }}</td>
          <td>{{ evento.artista_principal }}</td>
          <td><span style="text-transform: capitalize;">{{ evento.categoria_eventos }}</span></td>
          <td>{{ evento.duracion_minutos }} min</td>
          <td>{{ evento.precio_entrada }} Bs</td>
          <td>{{ evento.fecha_evento }}</td>
          <td>{{ evento.estado }}</td>
        </tr>
        <tr v-if="eventos.length === 0">
          <td colspan="8" style="text-align: center;">No hay eventos registrados.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
th, td {
  text-align: left;
  padding: 10px;
  border-color: #444;
}
input, select {
  background: #2a2a2a;
  color: #fff;
  border: 1px solid #555;
  border-radius: 4px;
}
</style>