
const { DataTypes } = require('@ah/core').Values;
const { XML } = require('@ah/languages');
const { Validator, Utils } = require('@ah/core').CoreUtils;
const { FileChecker, FileReader, FileWriter } = require('@ah/core').FileSystem;
const XMLDefinitions = require('@ah/xml-definitions');
const XMLParser = XML.XMLParser;
const XMLUtils = XML.XMLUtils;

const SORT_ORDER = {
    SIMPLE_FIRST: 'simpleFirst',
    COMPLEX_FIRST: 'complexFirst',
    ALPHABET_ASC: 'alphabetAsc',
    ALPHABET_DESC: 'alphabetDesc'
}

const NEWLINE = '\r\n';
let typeDefinition;
function getCompressedContentSync(filePathOrXMLRoot, sortOrder) {
    if (Utils.isString(filePathOrXMLRoot)) {
        if (FileChecker.isDirectory(filePathOrXMLRoot))
            throw new Error('Can\'t get compressed content from a directory. Select a single file');
        filePathOrXMLRoot = Validator.validateFilePath(filePathOrXMLRoot);
    }
    return compressXML(filePathOrXMLRoot, sortOrder);
}

function getCompressedContent(filePathOrXMLRoot, sortOrder) {
    return new Promise(function (resolve, reject) {
        try {
            if (Utils.isString(filePathOrXMLRoot)) {
                if (FileChecker.isDirectory(filePathOrXMLRoot))
                    throw new Error('Can\'t get compressed content from a directory. Select a single file');
                filePathOrXMLRoot = Validator.validateFilePath(filePathOrXMLRoot);
            }
            resolve(compressXML(filePathOrXMLRoot, sortOrder));
        } catch (error) {
            reject(error);
        }
    });
}

function compressSync(filePath, sortOrder) {
    if (FileChecker.isDirectory(filePath)) {
        throw new Error('Can\'t compress directory on sync mode. Execute compress() method to compress entire directory');
    } else {
        filePath = Validator.validateFilePath(filePath);
        let xmlContent = compressXML(filePath, sortOrder);
        FileWriter.createFileSync(filePath, xmlContent);
    }
}

function compress(pathOrPaths, sortOrder, callback) {
    return new Promise(async function (resolve, reject) {
        try {
            const paths = Utils.forceArray(pathOrPaths);
            const pathsToCompress = [];
            let nFiles = 0;
            let nFolders = 0;
            for (let path of paths) {
                if (FileChecker.isFile(path)) {
                    nFiles++;
                    pathsToCompress.push(Validator.validateFilePath(path));
                } else {
                    nFolders++;
                    pathsToCompress.push(Validator.validateFolderPath(path));
                }
            }
            if (nFiles == 0 && nFolders == 0)
                throw new Error('Not files or folders selected to compress');
            else if (nFiles > 0 && nFolders > 0) 
                throw new Error('Can\'t compress files and folders at the same time. Please, add only folders or files to compress');
            else if (nFolders > 1) 
                throw new Error('Can\'t compress more than one folder at the same time.');
            if (nFolders == 1) {
                const files = await FileReader.getAllFiles(pathsToCompress[0], ['.xml']);
                Utils.sort(files);
                const totalFiles = files.length;
                let filesProcessed = 0;
                for (const file of files) {
                    try {
                        const xmlContent = compressXML(file, sortOrder);
                        FileWriter.createFile(file, xmlContent, function () {
                            filesProcessed++;
                            if (callback)
                                callback.call(this, file, true, filesProcessed, totalFiles);
                        });
                    } catch (error) {
                        filesProcessed++;
                        if (callback)
                            callback.call(this, file, false, filesProcessed, totalFiles);                                
                    }
                }
                resolve();
            } else {
                const totalFiles = pathsToCompress.length;
                let filesProcessed = 0;
                for (const pathToCompress of pathsToCompress) {
                    try{
                        let xmlContent = compressXML(pathToCompress, sortOrder);
                        FileWriter.createFile(pathToCompress, xmlContent, function () {
                            filesProcessed++;
                            if (callback)
                                callback.call(this, pathToCompress, false, filesProcessed, totalFiles);
                        });
                    } catch(error){
                        filesProcessed++;
                        if (callback)
                            callback.call(this, pathToCompress, false, filesProcessed, totalFiles);
                    }
                }
                resolve();
            }
        } catch (error) {
            reject(error)
        }
    });
}

function compressXML(filePathOrXMLRoot, sortOrder) {
    if (!sortOrder)
        sortOrder = SORT_ORDER.ALPHABET_ASC;
    let xmlRoot;
    if (Utils.isString(filePathOrXMLRoot))
        xmlRoot = XMLParser.parseXML(FileReader.readFileSync(filePathOrXMLRoot), true);
    else
        xmlRoot = filePathOrXMLRoot;
    let type = Object.keys(xmlRoot)[0];
    typeDefinition = XMLDefinitions.getRawDefinition(type);
    let xmlData = XMLUtils.cleanXMLFile(typeDefinition, xmlRoot[type]);
    if (xmlData === undefined && filePathOrXMLRoot === 'string')
        throw new Error('The file ' + filePathOrXMLRoot + ' of MetadataType ' + type + ' does not support compression');
    else if (xmlData === undefined)
        throw new Error('The selected XML content of MetadataType ' + type + ' does not support compression');
    return processXMLData(type, xmlData, sortOrder);
}

function processXMLData(type, xmlData, sortOrder) {
    let content = XMLParser.getXMLFirstLine() + NEWLINE;
    let attributes = XMLUtils.getAttributes(xmlData);
    let indent = 0;
    let objectKeys = getOrderedKeys(typeDefinition, sortOrder);
    content += XMLParser.getStartTag(type, attributes) + NEWLINE;
    try {
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
    } catch (error) {
        throw error;
    }
    content += XMLParser.getEndTag(type);
    return content;
}

function processXMLField(fieldDefinition, fieldValue, sortOrder, indent) {
    let content = '';
    if (mustCompress(fieldDefinition)) {
        if (isComplexField(fieldDefinition)) {
            let objectKeys = getOrderedKeys(fieldDefinition, sortOrder);
            if (Array.isArray(fieldValue) || fieldDefinition.datatype === DataTypes.ARRAY) {
                fieldValue = XMLUtils.forceArray(fieldValue);
                if (fieldDefinition.sortOrder !== undefined)
                    XMLUtils.sort(fieldValue, fieldDefinition.sortOrder);
                for (let value of fieldValue) {
                    content += XMLUtils.getTabs(indent) + XMLParser.getStartTag(fieldDefinition.key, XMLUtils.getAttributes(fieldValue));
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
                                if (subFieldDefinition.datatype === DataTypes.OBJECT) {
                                    content += processXMLField(subFieldDefinition, subFieldValue, sortOrder, 0);
                                } else {
                                    content += XMLParser.getXMLElement(subFieldDefinition.key, XMLUtils.getAttributes(subFieldValue), subFieldDefinition.prepareValue(subFieldValue));
                                }
                            }
                        }
                    } else {
                        content += fieldDefinition.prepareValue(value);
                    }
                    content += XMLParser.getEndTag(fieldDefinition.key) + NEWLINE;
                }
            } else {
                let empty = fieldValue === undefined || fieldValue === null || fieldValue === '';
                if (!empty && fieldValue !== undefined && fieldValue['@attrs'] !== undefined && Object.keys(fieldValue).length === 1) {
                    empty = true;
                }
                content += XMLUtils.getTabs(indent) + XMLParser.getStartTag(fieldDefinition.key, XMLUtils.getAttributes(fieldValue), empty);
                if (!empty) {
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
                            content += XMLParser.getXMLElement(subFieldDefinition.key, XMLUtils.getAttributes(subFieldValue), subFieldDefinition.prepareValue(subFieldValue));
                        }
                    }
                    content += XMLParser.getEndTag(fieldDefinition.key) + (indent === 0 ? '' : NEWLINE);
                }
            }
        } else {
            content = XMLUtils.getTabs(indent) + XMLParser.getXMLElement(fieldDefinition.key, XMLUtils.getAttributes(fieldValue), fieldDefinition.prepareValue(fieldValue)) + NEWLINE;
        }
    } else {
        let objectKeys = getOrderedKeys(fieldDefinition, sortOrder);
        if (Array.isArray(fieldValue) || fieldDefinition.datatype === DataTypes.ARRAY) {
            fieldValue = XMLUtils.forceArray(fieldValue);
            if (fieldDefinition.sortOrder !== undefined)
                XMLUtils.sort(fieldValue, fieldDefinition.sortOrder);
            for (let value of fieldValue) {
                if (!objectKeys) {
                    content += XMLUtils.getTabs(indent) + XMLParser.getStartTag(fieldDefinition.key, XMLUtils.getAttributes(fieldValue)) + fieldDefinition.prepareValue(value) + XMLParser.getEndTag(fieldDefinition.key) + NEWLINE;
                } else {
                    content += XMLUtils.getTabs(indent) + XMLParser.getStartTag(fieldDefinition.key, XMLUtils.getAttributes(fieldValue)) + NEWLINE;
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
                    content += XMLUtils.getTabs(indent) + XMLParser.getEndTag(fieldDefinition.key) + NEWLINE;
                }
            }
        } else {
            let empty = fieldValue === undefined || fieldValue === null || fieldValue === '';
            if (!empty && fieldValue['@attrs'] !== undefined && Object.keys(fieldValue).length === 1) {
                empty = true;
            }
            content += XMLUtils.getTabs(indent) + XMLParser.getStartTag(fieldDefinition.key, XMLUtils.getAttributes(fieldValue), empty) + NEWLINE;
            if (!empty) {
                try {
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
                } catch (error) {
                    throw error;
                }
                content += XMLUtils.getTabs(indent) + XMLParser.getEndTag(fieldDefinition.key) + NEWLINE;
            }
        }
    }
    return content;
}

function mustCompress(field) {
    if (isComplexField(field)) {
        if (field.compress) {
            return true;
        } else {
            if (field.fields) {
                for (let key of Object.keys(field.fields)) {
                    if (isComplexField(field.fields[key]))
                        return false;
                }
                return true;
            }
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
    return xmlField.datatype === DataTypes.ARRAY || xmlField.datatype === DataTypes.OBJECT;
}

module.exports = {
    compressSync: compressSync,
    compress: compress,
    getCompressedContent: getCompressedContent,
    getCompressedContentSync: getCompressedContentSync,
    SORT_ORDER: SORT_ORDER
}