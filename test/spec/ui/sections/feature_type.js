import { setTimeout } from 'node:timers/promises';
import * as vueApp from '../../../../modules/ui/vue/app.js';

describe('iD.uiSectionFeatureType', function() {
    var context, container, entity, section;
    var testPresetID = 'feature_type_test/cafe';

    before(function() {
        iD.presetManager.merge({
            presets: {
                [testPresetID]: {
                    name: 'FeatureTypeTestCafe',
                    tags: { amenity: 'feature_type_test_cafe' },
                    geometry: ['point']
                }
            }
        });
    });

    after(function() {
        iD.presetManager.merge({
            presets: {
                [testPresetID]: null
            }
        });
    });

    beforeEach(function() {
        entity = iD.osmNode({ id: 'n1', loc: [0, 0], tags: { amenity: 'feature_type_test_cafe' } });
        context = iD.coreContext().assetPath('../dist/').init();
        context.history().merge([entity]);
        container = d3.select('body').append('div').attr('class', 'ui-wrap');
        vueApp.initVueApp(context, document.body);

        section = iD.uiSectionFeatureType(context)
            .entityIDs([entity.id])
            .presets([iD.presetManager.item(testPresetID)])
            .expandedByDefault(true);

        container.call(section.render);
    });

    afterEach(function() {
        vueApp.destroyVueApp();
        container.remove();
    });

    it('renders the Vue shell and icon container', async function() {
        await setTimeout(20);

        expect(container.select('.preset-list-button-wrap').empty()).to.be.false;
        expect(container.select('.preset-icon-container').empty()).to.be.false;
        expect(container.select('.label-inner').text()).to.contain('FeatureTypeTestCafe');
    });

    it('cleans up the Vue shell on unmount', async function() {
        await setTimeout(20);
        expect(container.select('.preset-list-button-wrap').empty()).to.be.false;

        section.unmount();
        await setTimeout(20);

        expect(container.select('.preset-icon-container .preset-icon').empty()).to.be.true;
    });
});
