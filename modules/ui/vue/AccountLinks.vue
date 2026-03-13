<template>
  <li class="userInfo" :class="{ hide: !user }">
    <a v-if="user" :href="userUrl" target="_blank">
      <img v-if="user.image_url" class="icon pre-text user-icon" :src="user.image_url">
      <svg v-else class="icon pre-text light">
        <use href="#iD-icon-avatar" />
      </svg>
      <span class="label">{{ user.display_name }}</span>
    </a>
  </li>
  <li class="loginLogout" :class="{ hide: !osm }">
    <a href="#" @click.prevent="handleAuth">{{ user ? t('logout') : t('login') }}</a>
  </li>
</template>

<script setup>
import { computed } from 'vue';
import { t } from '../../core/localizer';
import { useContext } from './useContext';

const props = defineProps({
  state: {
    type: Object,
    required: true
  }
});

const { connection } = useContext();
const osm = connection();

const user = computed(() => props.state.user);
const userUrl = computed(() => user.value ? osm.userURL(user.value.display_name) : '#');

function handleAuth() {
  if (!osm) return;
  if (user.value) {
    osm.logout();
    osm.authenticate(undefined, { switchUser: true });
  } else {
    osm.authenticate();
  }
}
</script>
