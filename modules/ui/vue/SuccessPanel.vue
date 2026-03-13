<template>
  <div class="header fillL">
    <h2>{{ t('success.just_edited') }}</h2>
    <button class="close" :title="t('icons.close')" @click="state.cancel()">
      <svg class="icon"><use href="#iD-icon-close" /></svg>
    </button>
  </div>

  <div class="body save-success fillL">
    <div class="save-summary">
      <h3>{{ thankYouText }}</h3>
      <p>
        <span>{{ t('success.help_html') }}</span>
        <a class="link-out" target="_blank" :href="t('success.help_link_url')">
          <svg class="icon inline"><use href="#iD-icon-out-link" /></svg>
          <span>{{ t('success.help_link_text') }}</span>
        </a>
      </p>

      <table v-if="changesetURL" class="summary-table">
        <tbody>
        <tr class="summary-row">
          <td class="cell-icon summary-icon">
            <a target="_blank" :href="changesetURL">
              <svg class="logo-small"><use href="#iD-logo-osm" /></svg>
            </a>
          </td>
          <td class="cell-detail summary-detail">
            <a class="cell-detail summary-view-on-osm" target="_blank" :href="changesetURL">{{ t('success.view_on_osm') }}</a>
            <div v-html="changesetIdHtml"></div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showDonation" class="save-supporting">
      <h3>{{ t('success.supporting.title') }}</h3>
      <p>{{ t('success.supporting.details') }}</p>
      <table class="supporting-table">
        <tbody>
        <tr class="supporting-row">
          <td class="cell-icon supporting-icon">
            <a target="_blank" href="https://supporting.openstreetmap.org/">
              <svg class="logo-small"><use href="#iD-donation" /></svg>
            </a>
          </td>
          <td class="cell-detail supporting-detail">
            <a class="cell-detail support-the-map" target="_blank" href="https://supporting.openstreetmap.org/">
              {{ t('success.supporting.donation.title') }}
            </a>
            <div>{{ t('success.supporting.donation.details') }}</div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <div v-if="communities.length" class="save-communityLinks">
      <h3>{{ t('success.like_osm') }}</h3>
      <table class="community-table">
        <tbody>
        <tr v-for="resource in communities" :key="resource.id" class="community-row">
          <td class="cell-icon community-icon">
            <a target="_blank" :href="resource.resolved.url">
              <svg class="logo-small"><use :href="`#community-${resource.type}`" /></svg>
            </a>
          </td>
          <td class="cell-detail community-detail">
            <div class="community-name" v-html="resource.resolved.nameHTML"></div>
            <div class="community-description" v-html="resource.resolved.descriptionHTML"></div>

            <details v-if="resource.resolved.extendedDescriptionHTML || (resource.languageCodes && resource.languageCodes.length)">
              <summary>{{ t('success.more') }}</summary>
              <div class="community-more">
                <div v-if="resource.resolved.extendedDescriptionHTML" class="community-extended-description" v-html="resource.resolved.extendedDescriptionHTML"></div>
                <div v-if="resource.languageCodes && resource.languageCodes.length" class="community-languages">
                  {{ t('success.languages', { languages: resource.languageCodes.map(code => localizer.languageName(code)).join(', ') }) }}
                </div>
              </div>
            </details>

            <details v-if="nextEvents(resource).length">
              <summary>
                {{ t('success.events') }}
                <span class="badge-text">{{ nextEvents(resource).length }}</span>
              </summary>
              <div class="community-events">
                <div v-for="event in nextEvents(resource)" :key="event.url + event.when" class="community-event">
                  <div class="community-event-name">
                    <a target="_blank" :href="event.url">{{ eventDisplayName(resource.id, event) }}</a>
                  </div>
                  <div class="community-event-when">{{ eventWhen(event) }}</div>
                  <div class="community-event-where">{{ eventWhere(resource.id, event) }}</div>
                  <div class="community-event-description">{{ eventDescription(resource.id, event) }}</div>
                </div>
              </div>
            </details>
          </td>
        </tr>
        </tbody>
      </table>

      <div class="community-missing">
        <span>{{ t('success.missing') }}</span>
        <a class="link-out" target="_blank" href="https://github.com/osmlab/osm-community-index/issues">
          <svg class="icon inline"><use href="#iD-icon-out-link" /></svg>
          <span>{{ t('success.tell_us') }}</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { resolveStrings } from 'osm-community-index';
import { showDonationMessage } from '../../../config/id.js';
import { fileFetcher } from '../../core/file_fetcher';
import { locationManager } from '../../core/LocationManager';
import { t, localizer } from '../../core/localizer';
import { useContext } from './useContext';

const props = defineProps({ state: { type: Object, required: true } });
const { context, connection } = useContext();
const communities = ref([]);
let ociCache = null;
const MAXEVENTS = 2;

const changesetURL = computed(() => {
  const osm = connection();
  const changeset = props.state.changeset;
  return osm && changeset ? osm.changesetURL(changeset.id) : '';
});

const thankYouText = computed(() => {
  const key = 'success.thank_you' + (props.state.location ? '_location' : '');
  return t(key, { where: props.state.location });
});

const changesetIdHtml = computed(() => {
  if (!changesetURL.value || !props.state.changeset) return '';
  return t.html('success.changeset_id', {
    changeset_id: { html: `<a href="${changesetURL.value}" target="_blank">${props.state.changeset.id}</a>` }
  });
});

const showDonation = computed(() => showDonationMessage !== false);

function parseEventDate(when) {
  if (!when) return null;
  let raw = when.trim();
  if (!raw) return null;
  if (!/Z$/.test(raw)) raw += 'Z';
  const parsed = new Date(raw);
  return new Date(parsed.toUTCString().slice(0, 25));
}

async function ensureOSMCommunityIndex() {
  if (ociCache) return ociCache;
  const vals = await Promise.all([
    fileFetcher.get('oci_features'),
    fileFetcher.get('oci_resources'),
    fileFetcher.get('oci_defaults')
  ]);

  if (vals[0] && Array.isArray(vals[0].features)) {
    locationManager.mergeCustomGeoJSON(vals[0]);
  }
  const ociResources = Object.values(vals[1].resources);
  if (ociResources.length) {
    await locationManager.mergeLocationSets(ociResources);
  }
  ociCache = { resources: ociResources, defaults: vals[2].defaults };
  return ociCache;
}

async function loadCommunities() {
  communities.value = [];
  const oci = await ensureOSMCommunityIndex();
  const loc = context.map().center();
  const validHere = locationManager.locationSetsAt(loc);
  const items = [];
  oci.resources.forEach(resource => {
    let area = validHere[resource.locationSetID];
    if (!area) return;
    const localize = stringID => t.html(`community.${stringID}`);
    resource.resolved = resolveStrings(resource, oci.defaults, localize);
    items.push({ area: area, order: resource.order || 0, resource: resource });
  });
  items.sort((a, b) => a.area - b.area || b.order - a.order);
  communities.value = items.map(d => d.resource);
}

function nextEvents(resource) {
  return (resource.events || [])
    .map(event => ({ ...event, date: parseEventDate(event.when) }))
    .filter(event => {
      const tm = event.date?.getTime();
      const now = (new Date()).setHours(0, 0, 0, 0);
      return !isNaN(tm) && tm >= now;
    })
    .sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0)
    .slice(0, MAXEVENTS);
}

function eventDisplayName(communityID, event) {
  let name = event.name;
  if (event.i18n && event.id) {
    name = t(`community.${communityID}.events.${event.id}.name`, { default: name });
  }
  return name;
}

function eventWhere(communityID, event) {
  let where = event.where;
  if (event.i18n && event.id) {
    where = t(`community.${communityID}.events.${event.id}.where`, { default: where });
  }
  return where;
}

function eventDescription(communityID, event) {
  let description = event.description;
  if (event.i18n && event.id) {
    description = t(`community.${communityID}.events.${event.id}.description`, { default: description });
  }
  return description;
}

function eventWhen(event) {
  let options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
  if (event.date.getHours() || event.date.getMinutes()) {
    options.hour = 'numeric';
    options.minute = 'numeric';
  }
  return event.date.toLocaleString(localizer.localeCode(), options);
}

onMounted(loadCommunities);
watch(() => context.map().center(), loadCommunities);
</script>
