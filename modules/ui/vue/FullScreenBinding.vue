<template>
  <span class="hide"></span>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { uiCmd } from '../cmd';
import { utilDetect } from '../../util/detect';
import { useContext } from './useContext';

const { context } = useContext();
const element = context.container().node();

function getFullScreenFn() {
  return element.requestFullscreen || element.msRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
}

function getExitFullScreenFn() {
  return document.exitFullscreen || document.msExitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen;
}

function isFullScreen() {
  return document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
}

function fullScreen(e) {
  e.preventDefault();
  if (!isFullScreen()) {
    getFullScreenFn()?.apply(element);
  } else {
    getExitFullScreenFn()?.apply(document);
  }
}

const detected = utilDetect();
const keys = detected.os === 'mac' ? [uiCmd('⌃⌘F'), 'f11'] : ['f11'];

onMounted(() => {
  if (!getFullScreenFn()) return;
  context.keybinding().on(keys, fullScreen);
});

onUnmounted(() => {
  context.keybinding().on(keys, null);
});
</script>
