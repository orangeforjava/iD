import { osmRelation, osmWay } from '../osm';
import { mountVueComponent } from './vue/bridge';
import ViewOnOSMLink from './vue/ViewOnOSMLink.vue';


export function uiViewOnOSM(context) {
  var state = { what: null };
  var render = mountVueComponent(ViewOnOSMLink, context, { state: state });

  render.what = function(_) {
    if (!arguments.length) return state.what;
    state.what = _;
    return render;
  };

  return render;
}


uiViewOnOSM.findLastModifiedChild = (graph, feature) => {
  let latest = feature;

  function recurseChilds(obj) {
    if (obj.timestamp > latest.timestamp) {
      latest = obj;
    }
    if (obj instanceof osmWay) {
      obj.nodes
        .map(id => graph.hasEntity(id))
        .filter(Boolean)
        .forEach(recurseChilds);
    } else if (obj instanceof osmRelation) {
      obj.members
        .map(m => graph.hasEntity(m.id))
        .filter(e => e instanceof osmWay || e instanceof osmRelation)
        .forEach(recurseChilds);
    }
  }

  recurseChilds(feature);
  return latest;
};
