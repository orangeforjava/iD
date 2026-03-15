import { setTimeout } from 'node:timers/promises';
import { initVueApp, destroyVueApp } from '../../../../modules/ui/vue/app.js';

describe('iD.uiFieldRadio', function() {
    var context, selection;

    beforeEach(function() {
        context = iD.coreContext().assetPath('../dist/').init();
        selection = d3.select(document.createElement('div'));
        initVueApp(context, selection.node());
    });

    afterEach(function() {
        destroyVueApp();
    });

    async function render(component) {
        selection.call(component);
        await setTimeout(20);
    }

    it('renders the Vue shell for a basic radio field', async function() {
        var field = iD.presetField('surface', {
            key: 'surface',
            type: 'radio',
            options: ['paved', 'unpaved']
        });

        var radio = iD.uiFieldRadio(field, context);
        await render(radio);
        radio.tags({ surface: 'paved' });

        expect(selection.select('.form-field-input-wrap.form-field-input-radio').empty()).to.be.false;
        expect(selection.selectAll('label').size()).to.equal(2);
        expect(selection.select('.placeholder').text()).to.equal(field.t('options.paved', { default: 'paved' }));
        expect(selection.selectAll('input:checked').size()).to.equal(1);
    });

    it('renders structure extras for structure radio', async function() {
        var field = iD.presetField('structure', {
            type: 'structureRadio',
            keys: ['bridge', 'tunnel']
        });

        var radio = iD.uiFieldStructureRadio(field, context).entityIDs(['w1']);
        await render(radio);
        radio.tags({ bridge: 'yes', layer: '1' });
        await setTimeout(20);

        expect(selection.select('.structure-extras-wrap').empty()).to.be.false;
    });
});
