import { setTimeout } from 'node:timers/promises';
import * as vueApp from '../../../../modules/ui/vue/app.js';

describe('iD.uiSectionOverlayList', function() {
    var context, container, section;

    beforeEach(function() {
        context = iD.coreContext().assetPath('../dist/').init();
        container = d3.select('body').append('div').attr('class', 'ui-wrap');
        vueApp.initVueApp(context, document.body);

        section = iD.uiSectionOverlayList(context)
            .expandedByDefault(true);

        container.call(section.render);
    });

    afterEach(function() {
        vueApp.destroyVueApp();
        container.remove();
    });

    it('renders the Vue shell for overlay list', async function() {
        await setTimeout(20);

        expect(container.select('.layer-overlay-list').empty()).to.be.false;
    });

    it('cleans up the Vue shell on unmount', async function() {
        await setTimeout(20);
        expect(container.select('.layer-overlay-list').empty()).to.be.false;

        section.unmount();
        await setTimeout(20);

        expect(container.select('.layer-overlay-list').empty()).to.be.true;
    });
});
