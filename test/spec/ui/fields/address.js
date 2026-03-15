import { setTimeout } from 'node:timers/promises';

describe('iD.uiFieldAddress', function() {
    var context, selection, field, entity;

    before(function() {
        iD.fileFetcher.cache().address_formats = [{
            format: [
                ['housenumber', 'street'],
                ['city', 'postcode']
            ]
        }];

        iD.presetManager.merge({
            fields: {
                address: {
                    key: 'addr',
                    type: 'address',
                    strings: {
                        placeholders: {
                            housenumber: 'House number',
                            street: 'Street',
                            city: 'City',
                            postcode: 'Postcode',
                            place: 'Place'
                        }
                    }
                }
            }
        });
    });


    after(function() {
        delete iD.fileFetcher.cache().address_formats;
    });


    beforeEach(function() {
        context = iD.coreContext().assetPath('../dist/').init();
        selection = d3.select(document.createElement('div'));
        field = iD.presetField('address', { key: 'addr', type: 'address' });
        entity = iD.osmNode({ id: 'n1', loc: [13.4050, 52.5200] });
        context.history().merge([entity]);
    });


    it('renders the address field shell and rows', async () => {
        var address = iD.uiFieldAddress(field, context);

        address.entityIDs([entity.id]);
        await setTimeout(20);
        selection.call(address);

        expect(selection.select('.form-field-input-address').empty()).to.be.false;
        expect(selection.selectAll('.addr-row').nodes().length).to.equal(2);
        expect(selection.selectAll('.addr-row input').nodes().length).to.equal(4);
    });


    it('updates rendered inputs from tags', async () => {
        var address = iD.uiFieldAddress(field, context);

        address.entityIDs([entity.id]);
        await setTimeout(20);
        selection.call(address);

        address.tags({
            'addr:housenumber': '12',
            'addr:street': 'Main Street',
            'addr:city': 'Sampletown',
            'addr:postcode': '12345'
        });

        expect(selection.select('.form-field-input-address').empty()).to.be.false;
        expect(selection.select('.addr-housenumber').property('value')).to.equal('12');
        expect(selection.select('.addr-street').property('value')).to.equal('Main Street');
        expect(selection.select('.addr-city').property('value')).to.equal('Sampletown');
        expect(selection.select('.addr-postcode').property('value')).to.equal('12345');
    });
});
