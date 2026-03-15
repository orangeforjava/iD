import { setTimeout } from 'node:timers/promises';
import * as vueApp from '../../../../modules/ui/vue/app.js';

describe('iD.uiSectionPresetFields', function() {
    var context, container, entity, section;
    var testPresetID = 'preset_fields_test/cafe';

    before(function() {
        iD.presetManager.merge({
            fields: {
                preset_fields_test_name: {
                    key: 'name',
                    type: 'text',
                    label: 'Preset Fields Test Name',
                    geometry: ['point']
                }
            },
            presets: {
                [testPresetID]: {
                    name: 'PresetFieldsTestCafe',
                    tags: { amenity: 'preset_fields_test_cafe' },
                    geometry: ['point'],
                    fields: ['preset_fields_test_name']
                }
            }
        });
    });

    after(function() {
        iD.presetManager.merge({
            presets: {
                [testPresetID]: null
            },
            fields: {
                preset_fields_test_name: null
            }
        });
    });

    beforeEach(function() {
        entity = iD.osmNode({ id: 'n1', loc: [0, 0], tags: { amenity: 'preset_fields_test_cafe', name: 'Cafe Name' } });
        context = iD.coreContext().assetPath('../dist/').init();
        context.history().merge([entity]);
        container = d3.select('body').append('div').attr('class', 'ui-wrap');
        vueApp.initVueApp(context, document.body);

        section = iD.uiSectionPresetFields(context)
            .entityIDs([entity.id])
            .presets([iD.presetManager.item(testPresetID)])
            .tags(entity.tags)
            .state('select')
            .expandedByDefault(true);

        container.call(section.render);
    });

    afterEach(function() {
        vueApp.destroyVueApp();
        container.remove();
    });

    it('renders preset field shells inside the Vue section shell', async function() {
        await setTimeout(40);

        expect(container.select('.grouped-items-area').empty()).to.be.false;
        expect(container.select('.form-fields-container').empty()).to.be.false;
        expect(container.select('.wrap-form-field-preset_fields_test_name').empty()).to.be.false;
    });

    it('cleans up section and nested field shells on unmount', async function() {
        await setTimeout(20);
        expect(container.select('.grouped-items-area').empty()).to.be.false;

        section.unmount();
        await setTimeout(20);

        expect(container.select('.grouped-items-area').empty()).to.be.true;
        expect(container.select('.form-field').empty()).to.be.true;
    });
});
