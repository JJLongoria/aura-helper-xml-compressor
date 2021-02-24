const Datatypes = require('./src/values/datatypes');
const MetadataTypes = require('./src/values/metadataTypes');
const XMLDefinitions = require('@ah/xml-definitions');
const XMLParser = require('./src/utils/xmlParser');
const Utils = require('./src/utils/utils');
const fs = require('fs');
const path = require('path');

const SORT_ORDER = {
    SIMPLE_FIRST: 'simpleFirst',
    COMPLEX_FIRST: 'complexFirst',
    ALPHABET_ASC: 'alphabetAsc',
    ALPHABET_DESC: 'alphabetDesc'
}

const NEWLINE = '\r\n';
let typeDefinition;
function getCompressedContentSync(filePath, sortOrder) {
    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory()) {
        throw new Error('Can\'t get compressed content from a directory. Select a single file');
    }
    return compressXML(filePath, sortOrder);
}

function getCompressedContent(filePath, sortOrder) {
    return new Promise(function (resolve, reject) {
        try {
            if (fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory()) {
                reject('Can\'t get compressed content from a directory. Select a single file');
            }
            resolve(compressXML(filePath, sortOrder));
        } catch (error) {
            reject(error);
        }
    });
}

function compressSync(filePath, sortOrder) {
    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory()) {
        throw new Error('Can\'t compress directory on sync mode. Execute compress() method to compress entire directory');
    } else {
        let xmlContent = compressXML(filePath, sortOrder);
        fs.writeFileSync(filePath, xmlContent);
    }
}

function compress(filePath, sortOrder, callback) {
    return new Promise(function (resolve, reject) {
        try {
            if (fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory()) {
                getAllXMLFiles(filePath).then(function (files) {
                    Utils.sort(files);
                    let filesToProcess = files.length;
                    for (let file of files) {
                        try {
                            let xmlContent = compressXML(file, sortOrder);
                            fs.writeFile(file, xmlContent, function () {
                                filesToProcess--;
                                if (callback)
                                    callback.call(this, file, true);
                                if (filesToProcess === 0)
                                    resolve();
                            });
                        } catch (error) {
                            filesToProcess--;
                            if (callback)
                                callback.call(this, file, false);
                            if (filesToProcess === 0)
                                resolve();
                        }
                    }
                });
            } else {
                let xmlContent = compressXML(filePath, sortOrder);
                fs.writeFile(filePath, xmlContent, function () {
                    resolve();
                });
            }
        } catch (error) {
            reject(error)
        }
    });
}

function compressXML(filePath, sortOrder) {
    if (!fs.existsSync(filePath))
        throw new Error('File not found. ' + filePath);
    if (!sortOrder)
        sortOrder = SORT_ORDER.ALPHABET_ASC;
    let xmlRoot = XMLParser.parseXML(fs.readFileSync(filePath, 'utf8'), true);
    let type = Object.keys(xmlRoot)[0];
    let xmlData = createXMLFile(type, xmlRoot[type]);
    if (xmlData === undefined)
        throw new Error('The file ' + filePath + ' of MetadataType  ' + type + ' does not support compression');
    return processXMLData(type, xmlData, sortOrder);
}

function processXMLData(type, xmlData, sortOrder) {
    let content = XMLParser.getXMLFirstLine() + NEWLINE;
    let attributes = Utils.getAttributes(xmlData);
    let indent = 0;
    if (!typeDefinition)
        typeDefinition = XMLDefinitions.getRawDefinition(type);
    let objectKeys = getOrderedKeys(typeDefinition, sortOrder);
    content += XMLParser.getStartTag(type, attributes) + NEWLINE;
    for (let key of objectKeys) {
        const fieldValue = xmlData[key];
        if (fieldValue != undefined) {
            if (!Array.isArray(fieldValue) && typeof fieldValue === 'object' && Object.keys(fieldValue).length === 0)
                continue;
            if (Array.isArray(fieldValue) && fieldValue.length === 0)
                continue;
            const fieldDefinition = typeDefinition[key];
            content += processXMLField(fieldDefinition, fieldValue, sortOrder, indent + 1);
        }
    }
    content += XMLParser.getEndTag(type);
    return content;
}

function processXMLField(fieldDefinition, fieldValue, sortOrder, indent) {
    let content = '';
    if (mustCompress(fieldDefinition)) {
        if (isComplexField(fieldDefinition)) {
            let objectKeys = getOrderedKeys(fieldDefinition, sortOrder);
            if (Array.isArray(fieldValue)) {
                if (fieldDefinition.sortOrder !== undefined)
                    Utils.sort(fieldValue, fieldDefinition.sortOrder);
                for (let value of fieldValue) {
                    content += Utils.getTabs(indent) + XMLParser.getStartTag(fieldDefinition.key, Utils.getAttributes(fieldValue));
                    if (objectKeys) {
                        for (let key of objectKeys) {
                            const subFieldValue = value[key];
                            if (subFieldValue !== undefined && subFieldValue !== null) {
                                if (!Array.isArray(subFieldValue) && typeof subFieldValue === 'object' && Object.keys(subFieldValue).length === 0)
                                    continue;
                                if (Array.isArray(subFieldValue) && subFieldValue.length === 0)
                                    continue;
                                let subFieldDefinition = fieldDefinition.fields[key];
                                if (subFieldDefinition.definitionRef)
                                    subFieldDefinition = XMLDefinitions.resolveDefinitionReference(subFieldDefinition);
                                content += XMLParser.getXMLElement(subFieldDefinition.key, Utils.getAttributes(subFieldValue), subFieldValue);
                            }
                        }
                    } else {
                        content += value;
                    }
                    content += XMLParser.getEndTag(fieldDefinition.key, Utils.getAttributes(fieldValue)) + NEWLINE;
                }
            } else {
                content += Utils.getTabs(indent) + XMLParser.getStartTag(fieldDefinition.key, Utils.getAttributes(fieldValue));
                for (let key of objectKeys) {
                    const subFieldValue = fieldValue[key];
                    if (subFieldValue !== undefined && subFieldValue !== null) {
                        if (!Array.isArray(subFieldValue) && typeof subFieldValue === 'object' && Object.keys(subFieldValue).length === 0)
                            continue;
                        if (Array.isArray(subFieldValue) && subFieldValue.length === 0)
                            continue;
                        let subFieldDefinition = fieldDefinition.fields[key];
                        if (subFieldDefinition.definitionRef)
                            subFieldDefinition = XMLDefinitions.resolveDefinitionReference(subFieldDefinition);
                        content += XMLParser.getXMLElement(subFieldDefinition.key, Utils.getAttributes(subFieldValue), subFieldValue);
                    }
                }
                content += XMLParser.getEndTag(fieldDefinition.key, Utils.getAttributes(fieldValue)) + NEWLINE;
            }
        } else {
            content = Utils.getTabs(indent) + XMLParser.getXMLElement(fieldDefinition.key, Utils.getAttributes(fieldValue), fieldValue) + NEWLINE;
        }
    } else {
        let objectKeys = getOrderedKeys(fieldDefinition, sortOrder);
        if (Array.isArray(fieldValue)) {
            if (fieldDefinition.sortOrder !== undefined)
                Utils.sort(fieldValue, fieldDefinition.sortOrder);
            for (let value of fieldValue) {
                content += Utils.getTabs(indent) + XMLParser.getStartTag(fieldDefinition.key, Utils.getAttributes(fieldValue)) + NEWLINE;
                for (let key of objectKeys) {
                    const subFieldValue = value[key];
                    if (subFieldValue !== undefined && subFieldValue !== null) {
                        if (!Array.isArray(subFieldValue) && typeof subFieldValue === 'object' && Object.keys(subFieldValue).length === 0)
                            continue;
                        if (Array.isArray(subFieldValue) && subFieldValue.length === 0)
                            continue;
                        let subFieldDefinition = fieldDefinition.fields[key];
                        if (subFieldDefinition.definitionRef)
                            subFieldDefinition = XMLDefinitions.resolveDefinitionReference(subFieldDefinition);
                        content += processXMLField(subFieldDefinition, subFieldValue, sortOrder, indent + 1);
                    }
                }
                content += Utils.getTabs(indent) + XMLParser.getEndTag(fieldDefinition.key, Utils.getAttributes(fieldValue)) + NEWLINE;
            }
        } else {
            content += Utils.getTabs(indent) + XMLParser.getStartTag(fieldDefinition.key, Utils.getAttributes(fieldValue)) + NEWLINE;
            for (let key of objectKeys) {
                const subFieldValue = fieldValue[key];
                if (subFieldValue !== undefined && subFieldValue !== null) {
                    if (!Array.isArray(subFieldValue) && typeof subFieldValue === 'object' && Object.keys(subFieldValue).length === 0)
                        continue;
                    if (Array.isArray(subFieldValue) && subFieldValue.length === 0)
                        continue;
                    let subFieldDefinition = fieldDefinition.fields[key];
                    if (subFieldDefinition.definitionRef)
                        subFieldDefinition = XMLDefinitions.resolveDefinitionReference(subFieldDefinition);
                    content += processXMLField(subFieldDefinition, subFieldValue, sortOrder, indent + 1);
                }
            }
            content += Utils.getTabs(indent) + XMLParser.getEndTag(fieldDefinition.key, Utils.getAttributes(fieldValue)) + NEWLINE;
        }
    }
    return content;
}

function mustCompress(field) {
    if (isComplexField(field)) {
        if (field.fields) {
            for (let key of Object.keys(field.fields)) {
                if (isComplexField(field.fields[key]))
                    return false;
            }
            return true;
        }
    } else {
        return true;
    }
}

function getOrderedKeys(xmlEntity, sortOrder) {
    let entityKeys;
    if (isComplexField(xmlEntity)) {
        if (xmlEntity.fields)
            xmlEntity = xmlEntity.fields;
        else
            return undefined;
    }
    entityKeys = Object.keys(xmlEntity);
    if (sortOrder === SORT_ORDER.ALPHABET_ASC) {
        entityKeys.sort(function (a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        });
    } else if (sortOrder === SORT_ORDER.ALPHABET_DESC) {
        entityKeys.sort(function (a, b) {
            return b.toLowerCase().localeCompare(a.toLowerCase());
        });
    } else if (sortOrder === SORT_ORDER.SIMPLE_FIRST || sortOrder === SORT_ORDER.COMPLEX_FIRST) {
        let simpleKeys = [];
        let complexKeys = [];
        for (let key of entityKeys) {
            if (isComplexField(xmlEntity[key])) {
                complexKeys.push(key);
            } else {
                simpleKeys.push(key);
            }
        }
        simpleKeys.sort(function (a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        });
        complexKeys.sort(function (a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        });
        entityKeys = [];
        if (sortOrder === SORT_ORDER.SIMPLE_FIRST) {
            entityKeys = entityKeys.concat(simpleKeys);
            entityKeys = entityKeys.concat(complexKeys);
        } else {
            entityKeys = entityKeys.concat(complexKeys);
            entityKeys = entityKeys.concat(simpleKeys);
        }
    }
    return entityKeys;
}

function isComplexField(xmlField) {
    return xmlField.datatype === Datatypes.ARRAY || xmlField.datatype === Datatypes.OBJECT;
}

function createXMLFile(type, xmlData) {
    let result;
    typeDefinition = XMLDefinitions.getRawDefinition(type);
    if (typeDefinition) {
        result = {};
        if (xmlData) {
            result = Utils.createXMLFile(typeDefinition);
            result = Utils.prepareXML(xmlData, result);
        } else {
            result = Utils.createXMLFile(typeDefinition);
        }
    }
    return result;
}

function getAllXMLFiles(dir) {
    return new Promise(function (resolve, rejected) {
        let results = [];
        fs.readdir(dir, function (err, list) {
            if (err)
                rejected(err);
            var pending = list.length;
            if (!pending)
                resolve(results);
            list.forEach(function (file) {
                file = path.resolve(dir, file);
                fs.stat(file, async function (err, stat) {
                    if (stat && stat.isDirectory()) {
                        let res = await getAllXMLFiles(file);
                        results = results.concat(res);
                        if (!--pending)
                            resolve(results);
                    } else {
                        if (file.endsWith('.xml'))
                            results.push(file);
                        if (!--pending)
                            resolve(results);
                    }
                });
            });
        });
    });
}

module.exports = {
    compressSync: compressSync,
    compress: compress,
    getCompressedContent: getCompressedContent,
    getCompressedContentSync: getCompressedContentSync,
    SORT_ORDER: SORT_ORDER
}