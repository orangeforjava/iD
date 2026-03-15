import { setTimeout } from 'node:timers/promises';
import * as vueApp from '../../../../modules/ui/vue/app.js';

describe('iD.uiSectionBackgroundDisplayOptions', function() {
    var context, container, section;

    beforeEach(function() {
        context = iD.coreContext().assetPath('../dist/').init();
        container = d3.select('body').append('div').attr('class', 'ui-wrap');
        vueApp.initVueApp(context, document.body);

        section = iD.uiSectionBackgroundDisplayOptions(context)
            .expandedByDefault(true);

        container.call(section.render);
    });

    afterEach(function() {
        vueApp.destroyVueApp();
        container.remove();
    });

    it('renders the Vue shell and display sliders', async function() {
        await setTimeout(20);

        expect(container.select('.display-options-container').empty()).to.be.false;
        expect(container.selectAll('.display-option-input').size()).to.equal(4);
    });

    it('cleans up the Vue shell on unmount', async function() {
        await setTimeout(20);
        expect(container.select('.display-options-container').empty()).to.be.false;

        section.unmount();
        await setTimeout(20);

        expect(container.select('.display-options-container').empty()).to.be.true;
    });
});
