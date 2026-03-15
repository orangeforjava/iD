import { setTimeout } from 'node:timers/promises';
import { initVueApp, destroyVueApp } from '../../../../modules/ui/vue/app.js';

describe('iD.uiFieldWikidata', function() {
    var context, selection, field, entity;

    before(function() {
        iD.services.wikidata = iD.serviceWikidata;
    });

    after(function() {
        delete iD.services.wikidata;
    });

    beforeEach(function() {
        entity = iD.osmNode({ id: 'n1', tags: { name: 'Berlin Central' } });
        context = iD.coreContext().assetPath('../dist/').init();
        context.history().merge([entity]);
        selection = d3.select(document.createElement('div'));
        initVueApp(context, selection.node());

        field = iD.presetField('wikidata', {
            key: 'wikidata',
            keys: ['wikidata', 'wikipedia'],
            type: 'wikidata'
        });

        fetchMock.reset();
        fetchMock.mock(new RegExp('/w/api\\.php.*action=wbgetentities'), {
            body: {
                entities: {
                    Q42: {
                        id: 'Q42',
                        labels: { en: { language: 'en', value: 'Douglas Adams' } },
                        descriptions: { en: { language: 'en', value: 'English writer' } },
                        sitelinks: { enwiki: { title: 'Douglas Adams' } }
                    }
                }
            },
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    });

    afterEach(function() {
        fetchMock.reset();
        destroyVueApp();
    });

    it('renders the Vue shell and search input', function() {
        var wikidata = iD.uiFieldWikidata(field, context);
        selection.call(wikidata);

        expect(selection.select('.form-field-input-wrap.form-field-input-wikidata').empty()).to.be.false;
        expect(selection.select('li.wikidata-search input').empty()).to.be.false;
        expect(selection.select('.preset-wikidata-description').empty()).to.be.false;
        expect(selection.select('.preset-wikidata-identifier').empty()).to.be.false;
    });

    it('updates description and identifier from tags', async function() {
        var wikidata = iD.uiFieldWikidata(field, context).entityIDs([entity.id]);
        selection.call(wikidata);
        wikidata.tags({ wikidata: 'Q42' });
        await setTimeout(20);

        expect(selection.select('.preset-wikidata-description input').property('value')).to.equal('English writer');
        expect(selection.select('.preset-wikidata-identifier input').property('value')).to.equal('Q42');
        expect(selection.select('button.wiki-link').classed('disabled')).to.be.false;
    });
});
