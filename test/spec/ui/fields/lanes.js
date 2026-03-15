describe('iD.uiFieldLanes', function() {
    var context, selection, field, entity;

    beforeEach(function() {
        context = iD.coreContext().assetPath('../dist/').init();
        context.container(d3.select(document.body).append('div').attr('class', 'ideditor'));

        entity = iD.osmWay({
            id: 'w1',
            nodes: ['n1', 'n2'],
            tags: {
                highway: 'residential',
                lanes: 2,
                oneway: 'yes',
                'lanes:forward': 1,
                'turn:lanes:forward': 'left|through'
            }
        });

        context.history().merge([
            iD.osmNode({ id: 'n1', loc: [0, 0] }),
            iD.osmNode({ id: 'n2', loc: [1, 0] }),
            entity
        ]);

        selection = d3.select(document.body).append('div').attr('class', 'lanes-test-wrap');
    });


    afterEach(function() {
        selection.remove();
        if (context && !context.container().empty()) {
            context.container().remove();
        }
    });


    it('renders the lanes surface and lane groups', function() {
        var lanes = iD.uiFieldLanes(field = iD.presetField('lanes', { key: 'lanes', type: 'lanes' }), context);
        lanes.entityIDs([entity.id]);

        selection.call(lanes);

        expect(selection.select('.form-field-input-lanes').empty()).to.be.false;
        expect(selection.select('svg.surface').empty()).to.be.false;
        expect(selection.select('g.lanes').empty()).to.be.false;
    });
});
