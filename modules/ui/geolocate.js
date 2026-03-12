import { mountVueComponent } from './vue/bridge';
import GeolocateButton from './vue/GeolocateButton.vue';

export function uiGeolocate(context) {
    return mountVueComponent(GeolocateButton, context);
}
