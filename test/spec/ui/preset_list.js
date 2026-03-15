import { setTimeout } from 'node:timers/promises';
import { initVueApp, destroyVueApp } from '../../../modules/ui/vue/app.js';

describe('iD.uiPresetList', function() {
    var context, container, selection, presetList, entity;

    const categoryID = 'preset_list_test_category';
    const cafeID = 'preset_list_test/cafe';
    const libraryID = 'preset_list_test/library';

    before(function() {
        iD.presetManager.merge({
            presets: {
                [cafeID]: {
                    name: 'PresetListTestCafe',
                    tags: { shop: 'preset_list_test_cafe' },
                    geometry: ['point']
                },
                [libraryID]: {
                    name: 'PresetListTestLibrary',
                    tags: { shop: 'preset_list_test_library' },
                    geometry: ['point']
                }
            },
            categories: {
                [categoryID]: {
                    members: [cafeID, libraryID]
                }
            }
        });
    });


    after(function() {
        iD.presetManager.merge({
            categories: {
                [categoryID]: null
            },
            presets: {
                [cafeID]: null,
                [libraryID]: null
            }
        });
        destroyVueApp();
    });


    beforeEach(function() {
        context = iD.coreContext().assetPath('../dist/').init();
        container = d3.select(document.body).append('div').attr('class', 'ideditor');
        context.container(container);
        initVueApp(context, container.node());

        entity = iD.osmNode({ id: 'n1', loc: [0, 0], tags: { shop: 'preset_list_test_cafe' } });
        context.history().merge([entity]);

        selection = container.append('div').attr('class', 'preset-list-pane');
        presetList = iD.uiPresetList(context)
            .entityIDs([entity.id])
            .autofocus(false);
    });


    afterEach(function() {
        if (presetList && presetList.unmount) {
            presetList.unmount();
        }
        destroyVueApp();
        selection.remove();
        container.remove();
    });


    it('updates current highlighting for existing Vue-rendered items', async function() {
        selection.call(presetList);
        await setTimeout(20);

        var search = selection.select('.preset-search-input');
        search.property('value', 'presetlisttest');
        iD.utilTriggerEvent(search, 'input');
        await setTimeout(20);

        expect(selection.select('.preset-preset_list_test-cafe').classed('current')).to.be.true;
        expect(selection.select('.preset-preset_list_test-library').classed('current')).to.be.false;

        presetList.presets([iD.presetManager.item(libraryID)]);
        iD.utilTriggerEvent(search, 'input');
        await setTimeout(20);

        expect(selection.select('.preset-preset_list_test-cafe').classed('current')).to.be.false;
        expect(selection.select('.preset-preset_list_test-library').classed('current')).to.be.true;
    });


    it('preserves expanded category state across redraws for cached Vue items', async function() {
        selection.call(presetList);
        await setTimeout(20);

        var search = selection.select('.preset-search-input');
        search.property('value', 'presetlisttest');
        iD.utilTriggerEvent(search, 'input');
        await setTimeout(20);

        var categoryButton = selection.select('.preset-preset_list_test_category .preset-list-button');
        expect(categoryButton.empty()).to.be.false;

        iD.utilTriggerEvent(categoryButton, 'click');
        await setTimeout(20);

        expect(categoryButton.classed('expanded')).to.be.true;
        expect(selection.selectAll('.preset-preset_list_test_category .subgrid .preset-list-item').size()).to.equal(2);

        iD.utilTriggerEvent(search, 'input');
        await setTimeout(20);

        selection.call(presetList);
        await setTimeout(20);

        categoryButton = selection.select('.preset-preset_list_test_category .preset-list-button');
        expect(categoryButton.classed('expanded')).to.be.true;
        expect(selection.selectAll('.preset-preset_list_test_category .subgrid .preset-list-item').size()).to.equal(2);
    });
});
