const XMLDefinitions = require('@ah/xml-definitions');
const Utils = require('../../../src/utils/utils');

describe('Testing ./src/utils/utils.js', () => {
    test('Testing createXMLFile()', () => {
        const typeDefinition = XMLDefinitions.getRawDefinition('Profile');
        let fileSchema = Utils.createXMLFile(typeDefinition);
        expect(fileSchema.classAccesses).toEqual([]);
    });
    test('Testing prepareXML()', () => {
        const typeDefinition = XMLDefinitions.getRawDefinition('Profile');
        let source = {
            description: 'Desc',
            classAccesses: [
                {
                    name: 'apexClass',
                    enabled: true
                }
            ],
            '@attrs': {
                attrs1: 'attrsValue'
            }
        };
        let target = Utils.createXMLFile(typeDefinition);
        let result = Utils.prepareXML(source, target);
        expect(result.description).toEqual('Desc');
        expect(result['@attrs']).toEqual({ attrs1: 'attrsValue' });
        delete source['@attrs'];
        target = Utils.createXMLFile(typeDefinition);
        result = Utils.prepareXML(source, target);
        expect(result.description).toEqual('Desc');
        expect(result['@attrs']).toEqual(undefined);
    });
    test('Testing forceArray()', () => {
        let result = Utils.forceArray('hi');
        expect(result).toEqual(['hi']);
        result = Utils.forceArray(['hi']);
        expect(result).toEqual(['hi']);
        result = Utils.forceArray(undefined);
        expect(result).toEqual([]);
    });
    test('Testing sort()', () => {
        let arrayToOrder = ['c', 'b', 'a'];
        Utils.sort(arrayToOrder);
        expect(arrayToOrder).toEqual(['a', 'b', 'c']);
        arrayToOrder = [{ name: 'testC', value: 'valueC' }, { name: 'testB', value: 'valueB' }];
        Utils.sort(arrayToOrder, ['name', 'value']);
        expect(arrayToOrder).toEqual([{ name: 'testB', value: 'valueB' }, { name: 'testC', value: 'valueC' }]);
        arrayToOrder = [{ name: 'testC', value: 'valueC' }, { name: 'testB', value: 'valueB' }];
        Utils.sort(arrayToOrder, ['name', 'values']);
        expect(arrayToOrder).toEqual([{ name: 'testB', value: 'valueB' }, { name: 'testC', value: 'valueC' }]);
        let notArrayToOrder = { name: 'testB', value: 'valueB' };
        Utils.sort(notArrayToOrder);
        expect(notArrayToOrder).toEqual({ name: 'testB', value: 'valueB' });
    });
    test('Testing getAttributes()', () => {
        let obj = {
            '@attrs': {
                name: 'value'
            }
        };
        let result = Utils.getAttributes(obj);
        expect(result).toEqual(['name="value"']);
    });
    test('Testing getText()', () => {
        let obj = {
            '#text': 'value'
        };
        let result = Utils.getText(obj);
        expect(result).toEqual('value');
        delete obj['#text'];
        result = Utils.getText(obj);
        expect(result).toEqual(undefined);
    });
    test('Testing getTabs()', () => {
        let result = Utils.getTabs(2);
        expect(result).toEqual('\t\t');
    });
});