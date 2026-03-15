import { setTimeout } from 'node:timers/promises';
import * as vueApp from '../../../../modules/ui/vue/app.js';

describe('iD.uiSectionValidationStatus', function() {
    var context, container, section;

    beforeEach(function() {
        context = iD.coreContext().assetPath('../dist/').init();
        container = d3.select('body').append('div').attr('class', 'ui-wrap');
        vueApp.initVueApp(context, document.body);

        section = iD.uiSectionValidationStatus(context);
        container.call(section.render);
    });

    afterEach(function() {
        vueApp.destroyVueApp();
        container.remove();
    });

    it('renders the Vue no-issues shell', async function() {
        await setTimeout(20);

        expect(container.select('.box').empty()).to.be.false;
        expect(container.select('.message').empty()).to.be.false;
        expect(container.select('.details').empty()).to.be.false;
    });

    it('cleans up the Vue shell on unmount', async function() {
        await setTimeout(20);
        expect(container.select('.box').empty()).to.be.false;

        section.unmount();
        await setTimeout(20);

        expect(container.select('.box').empty()).to.be.true;
    });
});
