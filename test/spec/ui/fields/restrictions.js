describe('iD.uiFieldRestrictions', function() {
    var context, selection, field;

    beforeEach(function() {
        context = iD.coreContext().assetPath('../dist/').init();
        context.container(d3.select(document.body).append('div').attr('class', 'ideditor'));
        var sidebar = context.container().append('div').attr('class', 'sidebar').node();
        sidebar.getBoundingClientRect = function() {
            return { width: 320, height: 600, top: 0, left: 0, right: 320, bottom: 600 };
        };

        context.history().merge([
            iD.osmNode({ id: 'n1', loc: [0, 0] }),
            iD.osmNode({ id: 'n2', loc: [1, 0] }),
            iD.osmNode({ id: 'n3', loc: [2, 0] }),
            iD.osmNode({ id: 'n4', loc: [1, 1] }),
            iD.osmNode({ id: 'n5', loc: [1, -1] }),
            iD.osmWay({ id: 'w1', nodes: ['n1', 'n2'], tags: { highway: 'residential' } }),
            iD.osmWay({ id: 'w2', nodes: ['n2', 'n3'], tags: { highway: 'residential' } }),
            iD.osmWay({ id: 'w3', nodes: ['n4', 'n2'], tags: { highway: 'residential' } }),
            iD.osmWay({ id: 'w4', nodes: ['n2', 'n5'], tags: { highway: 'residential' } })
        ]);

        selection = d3.select(document.body).append('div').attr('class', 'restrictions-test-wrap');
        field = iD.presetField('restrictions', { key: 'restriction', type: 'restrictions' });

        context.surface = function() { return selection.select('svg.surface'); };
        context.map = function() {
            return {
                isInWideSelection: function() { return false; }
            };
        };
    });


    afterEach(function() {
        selection.remove();
        if (context && !context.container().empty()) {
            context.container().remove();
        }
    });


    it('renders the restriction shell, viewer container, and controls', function() {
        var restrictions = iD.uiFieldRestrictions(field, context);
        restrictions.entityIDs(['n2']);

        selection.call(restrictions);

        expect(selection.select('.form-field-input-restrictions').empty()).to.be.false;
        expect(selection.select('.restriction-container').empty()).to.be.false;
        expect(selection.select('.restriction-help').empty()).to.be.false;
        expect(selection.select('.restriction-controls').empty()).to.be.false;
        expect(selection.select('.restriction-distance-input').empty()).to.be.false;
        expect(selection.select('.restriction-via-way-input').empty()).to.be.false;
    });
});
