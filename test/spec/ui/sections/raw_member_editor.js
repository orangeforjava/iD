import { setTimeout } from 'node:timers/promises';
import * as vueApp from '../../../../modules/ui/vue/app.js';

describe('iD.uiSectionRawMemberEditor', function() {
    var context, element, member, relation, section;

    function render() {
        section = iD.uiSectionRawMemberEditor(context)
            .entityIDs([relation.id])
            .expandedByDefault(true);

        element = d3.select('body')
            .append('div')
            .attr('class', 'ui-wrap')
            .call(section.render);
    }

    beforeEach(function() {
        member = iD.osmNode({ id: 'n1', tags: { name: 'Member Node' } });
        relation = iD.osmRelation({
            id: 'r1',
            tags: { type: 'route' },
            members: [{ id: member.id, type: member.type, role: 'stop' }]
        });

        context = iD.coreContext().assetPath('../dist/').init();
        context.history().merge([member, relation]);
        vueApp.initVueApp(context, document.body);
        render();
    });

    afterEach(function() {
        vueApp.destroyVueApp();
        d3.selectAll('.ui-wrap').remove();
    });

    it('renders member rows inside the Vue shell', async function() {
        await setTimeout(20);

        expect(element.select('.member-list').empty()).to.be.false;
        expect(element.selectAll('li.member-row').size()).to.equal(1);
        expect(element.select('input.member-role').property('value')).to.equal('stop');
    });

    it('cleans up the Vue shell on unmount', async function() {
        await setTimeout(20);

        expect(element.select('.member-list').empty()).to.be.false;

        section.unmount();
        await setTimeout(20);

        expect(element.select('.member-list').empty()).to.be.true;
    });
});
