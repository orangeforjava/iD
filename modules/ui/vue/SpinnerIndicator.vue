<template>
  <img :src="imageSrc" :style="{ opacity: loading ? 1 : 0 }">
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useContext } from './useContext';

const { context, connection } = useContext();
const osm = connection();
const loading = ref(false);
const imageSrc = context.imagePath('loader-black.gif');

function setLoading() {
  loading.value = true;
}

function setLoaded() {
  loading.value = false;
}

onMounted(() => {
  if (!osm) return;
  osm.on('loading.spinner', setLoading);
  osm.on('loaded.spinner', setLoaded);
});

onUnmounted(() => {
  if (!osm) return;
  osm.on('loading.spinner', null);
  osm.on('loaded.spinner', null);
});
</script>
