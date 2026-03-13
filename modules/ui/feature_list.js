import * as sexagesimal from '@mapbox/sexagesimal';
import { reactive } from 'vue';

import { presetManager } from '../presets';
import { t } from '../core/localizer';
import { dmsCoordinatePair, dmsMatcher } from '../util/units';
import { coreGraph } from '../core/graph';
import { geoSphericalDistance } from '../geo/geo';
import { geoExtent } from '../geo';
import { modeSelect } from '../modes/select';
import { osmEntity } from '../osm/entity';
import { getRelationColor } from '../osm/tags';
import { services } from '../services';
import { uiCmd } from './cmd';
import { utilDisplayName, utilDisplayType, utilHighlightEntities } from '../util';
import { mountVueComponent } from './vue/bridge';
import FeatureListPanel from './vue/FeatureListPanel.vue';


export const idMatch = q => {
  const idMatchRegex = /(?:^|\W)(node|way|relation|note|[nwr])\W{0,2}0*([1-9]\d*)(?:\W|$)/i;
  const matched = q.match(idMatchRegex);
  if (!matched) return false;

  return {
    type: matched[1] === 'note' ? matched[1] : matched[1].charAt(0),
    id: matched[2]
  };
};


export function uiFeatureList(context) {
  const state = reactive({
    query: '',
    results: [],
    geocodeResults: undefined,
    searchRef: null,
    showGeocodeButton: false,
    setSearchRef: function(el) { state.searchRef = el; },
    onInput: function() {
      state.geocodeResults = undefined;
      drawList();
    },
    onKeydown: function(e) {
      if (e.keyCode === 27 && state.searchRef) state.searchRef.blur();
    },
    onKeypress: function(e) {
      if (e.keyCode === 13 && state.query.length && state.results.length) {
        state.onClick(e, state.results[0]);
      }
    },
    onMouseover: function(d) {
      if (d.location !== undefined) return;
      utilHighlightEntities([d.id], true, context);
    },
    onMouseout: function(d) {
      if (d.location !== undefined) return;
      utilHighlightEntities([d.id], false, context);
    },
    onClick: function(e, d) {
      e.preventDefault();
      if (d.location) {
        context.map().centerZoomEase([d.location[1], d.location[0]], d.zoom || 19);
      } else if (d.entity) {
        utilHighlightEntities([d.id], false, context);
        context.enter(modeSelect(context, [d.entity.id]));
        context.map().zoomToEase(d.entity);
      } else if (d.geometry === 'note') {
        context.moveToNote(d.id.replace(/\D/g, ''));
      } else {
        context.zoomToEntity(d.id);
      }
    },
    onGeocodeSearch: function() {
      services.geocoder.search(state.query, function(err, resp) {
        state.geocodeResults = resp || [];
        drawList();
      });
    }
  });

  const render = mountVueComponent(FeatureListPanel, context, { state: state });

  function featureList(selection) {
    render(selection);

    context.on('exit.feature-list', clearSearch);
    context.map().on('drawn.feature-list', function(e) {
      if (e.full) drawList();
    });
    context.keybinding().on(uiCmd('⌘F'), focusSearch);

    drawList();
  }

  function focusSearch(e) {
    var mode = context.mode() && context.mode().id;
    if (mode !== 'browse' || !state.searchRef) return;
    e.preventDefault();
    state.searchRef.focus();
  }

  function clearSearch() {
    state.query = '';
    drawList();
  }

  function features() {
    var graph = context.graph();
    var visibleCenter = context.map().extent().center();
    var q = state.query.toLowerCase().trim();
    if (!q) return [];

    const locationMatch = sexagesimal.pair(q.toUpperCase()) || dmsMatcher(q);
    const coordResult = [];
    if (locationMatch) {
      const latLon = [Number(locationMatch[0]), Number(locationMatch[1])];
      const lonLat = [latLon[1], latLon[0]];
      const isLatLonValid = latLon[0] >= -90 && latLon[0] <= 90 && latLon[1] >= -180 && latLon[1] <= 180;
      let isLonLatValid = lonLat[0] >= -90 && lonLat[0] <= 90 && lonLat[1] >= -180 && lonLat[1] <= 180;
      isLonLatValid &&= !q.match(/[NSEW]/i);
      isLonLatValid &&= !locationMatch[2];
      isLonLatValid &&= lonLat[0] !== lonLat[1];
      if (isLatLonValid) {
        coordResult.push({ id: latLon[0] + '/' + latLon[1], geometry: 'point', type: t('inspector.location'), name: dmsCoordinatePair([latLon[1], latLon[0]]), location: latLon, zoom: locationMatch[2] });
      }
      if (isLonLatValid) {
        coordResult.push({ id: lonLat[0] + '/' + lonLat[1], geometry: 'point', type: t('inspector.location'), name: dmsCoordinatePair([lonLat[1], lonLat[0]]), location: lonLat });
      }
    }

    const idMatchResult = !locationMatch && idMatch(q);
    const idResult = [];
    if (idMatchResult) {
      const elemType = idMatchResult.type;
      const elemId = idMatchResult.id;
      idResult.push({
        id: elemType + elemId,
        geometry: elemType === 'n' ? 'point' : elemType === 'w' ? 'line' : elemType === 'note' ? 'note' : 'relation',
        type: elemType === 'n' ? t('inspector.node') : elemType === 'w' ? t('inspector.way') : elemType === 'note' ? t('note.note') : t('inspector.relation'),
        name: elemId
      });
    }

    var allEntities = graph.entities;
    const localResults = [];
    for (var id in allEntities) {
      var entity = allEntities[id];
      if (!entity) continue;

      var matched = presetManager.match(entity, graph);
      var name = utilDisplayName(entity, { hideNetwork: matched.suggestion }) || '';
      if (name.toLowerCase().indexOf(q) < 0) continue;
      var type = (matched && matched.name()) || utilDisplayType(entity.id);
      var extent = entity.extent(graph);
      var distance = extent ? geoSphericalDistance(visibleCenter, extent.center()) : 0;
      var relationRefs = [];
      if (entity.type === 'relation') {
        const hasRef = entity.tags.ref;
        const relColors = getRelationColor(entity.tags, '#555');
        if (relColors.isValid || hasRef) {
          relationRefs = (entity.tags.ref || '').split(';').filter(Boolean).map(ref => ({ text: ref, color: relColors.color, textColor: relColors.textColor }));
        }
      }

      localResults.push({ id: entity.id, entity: entity, geometry: entity.geometry(graph), type: type, name: name, distance: distance, relationRefs: relationRefs });
      if (localResults.length > 100) break;
    }
    localResults.sort((a, b) => a.distance - b.distance);

    const geocodeResults = [];
    (state.geocodeResults || []).forEach(function(d) {
      if (d.osm_type && d.osm_id) {
        var id = osmEntity.id.fromOSM(d.osm_type, d.osm_id);
        var tags = {};
        tags[d.class] = d.type;
        var attrs = { id: id, type: d.osm_type, tags: tags };
        if (d.osm_type === 'way') attrs.nodes = ['a', 'a'];
        var tempEntity = osmEntity(attrs);
        var tempGraph = coreGraph([tempEntity]);
        var matched = presetManager.match(tempEntity, tempGraph);
        var type = (matched && matched.name()) || utilDisplayType(id);
        geocodeResults.push({ id: tempEntity.id, geometry: tempEntity.geometry(tempGraph), type: type, name: d.display_name, extent: new geoExtent([Number(d.boundingbox[3]), Number(d.boundingbox[0])], [Number(d.boundingbox[2]), Number(d.boundingbox[1])]) });
      }
    });

    const extraResults = [];
    if (q.match(/^[0-9]+$/)) {
      extraResults.push({ id: 'n' + q, geometry: 'point', type: t('inspector.node'), name: q });
      extraResults.push({ id: 'w' + q, geometry: 'line', type: t('inspector.way'), name: q });
      extraResults.push({ id: 'r' + q, geometry: 'relation', type: t('inspector.relation'), name: q });
      extraResults.push({ id: 'note' + q, geometry: 'note', type: t('note.note'), name: q });
    }

    return [...idResult, ...localResults, ...coordResult, ...geocodeResults, ...extraResults];
  }

  function drawList() {
    const value = state.query;
    state.results = features();
    state.showGeocodeButton = !!(services.geocoder && value && state.geocodeResults === undefined);
  }

  return featureList;
}
