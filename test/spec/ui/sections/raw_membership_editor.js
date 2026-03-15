import { setTimeout } from 'node:timers/promises';
import * as vueApp from '../../../../modules/ui/vue/app.js';

describe('iD.uiSectionRawMembershipEditor', function() {
    var context, element, entity, relation, section;

    function render() {
        section = iD.uiSectionRawMembershipEditor(context)
            .entityIDs([entity.id])
            .expandedByDefault(true);

        element = d3.select('body')
            .append('div')
            .attr('class', 'ui-wrap')
            .call(section.render);
    }

    beforeEach(function() {
        entity = iD.osmNode({ id: 'n1', tags: { name: 'Selected Node' } });
        relation = iD.osmRelation({
            id: 'r1',
            tags: { type: 'multipolygon', name: 'Parent Relation' },
            members: [{ id: entity.id, type: entity.type, role: 'label' }]
        });

        context = iD.coreContext().assetPath('../dist/').init();
        context.history().merge([entity, relation]);
        vueApp.initVueApp(context, document.body);
        render();
    });

    afterEach(function() {
        vueApp.destroyVueApp();
        d3.selectAll('.ui-wrap').remove();
    });

    it('renders memberships and add-row inside the Vue shell', async function() {
        await setTimeout(20);

        expect(element.select('.member-list').empty()).to.be.false;
        expect(element.selectAll('li.member-row-normal').size()).to.equal(1);
        expect(element.select('input.member-role').property('value')).to.equal('label');
        expect(element.select('.add-row').empty()).to.be.false;
    });

    it('cleans up the Vue shell on unmount', async function() {
        await setTimeout(20);

        expect(element.select('.member-list').empty()).to.be.false;
        expect(element.select('.add-row').empty()).to.be.false;

        section.unmount();
        await setTimeout(20);

        expect(element.select('.member-list').empty()).to.be.true;
        expect(element.select('.add-row').empty()).to.be.true;
    });
});
