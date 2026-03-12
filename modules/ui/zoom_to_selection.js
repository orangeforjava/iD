import { mountVueComponent } from './vue/bridge';
import ZoomToSelectionButton from './vue/ZoomToSelectionButton.vue';

export function uiZoomToSelection(context) {
    return mountVueComponent(ZoomToSelectionButton, context);
}
