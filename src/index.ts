import { DataNotFoundException, FileChecker, OperationNotAllowedException, CoreUtils, FileReader, OperationNotSupportedException, FileWriter, Datatypes, XMLSortOrder } from "@aurahelper/core";
import { XML } from "@aurahelper/languages";
import { XMLDefinitions } from "@aurahelper/xml-definitions";
import EventEmitter from "events";

const XMLUtils = XML.XMLUtils;
const XMLParser = XML.XMLParser;
const Validator = CoreUtils.Validator;
const Utils = CoreUtils.Utils;

const NEWLINE = '\r\n';

const SORT_ORDER: XMLSortOrder = {
    SIMPLE_FIRST: 'simpleFirst',
    COMPLEX_FIRST: 'complexFirst',
    ALPHABET_ASC: 'alphabetAsc',
    ALPHABET_DESC: 'alphabetDesc'
};

const ON_COMPRESS_SUCCESS = 'compressSucess';
const ON_COMPRESS_FAILED = 'compressFailed';

export interface XMLCompressorStatus {
    file: string;
    filesProcessed: number;
    totalFiles: number;
}

/**
 * Class to compress any Salesforce Metadata XML Files to change the format
 * to make easy the work with GIT or another Version Control Systems because grant always the same order of the elements,
 * compress the file for ocuppy less storage and make GIT faster and, 
 * specially make merges conflict more easy to resolve because identify the changes better.
 * 
 * You can choose the sort order of the elements to reorganize the XML data as you like.
 * 
 * The setters methods are defined like a builder pattern to make it more usefull
 */
export class XMLCompressor {

    paths: string[];
    sortOrder: string;
    content?: string;
    xmlRoot?: any;
    private _xmlDefinition?: any;
    private _compressedContent?: string;
    private _event: EventEmitter;


    /**
     * Constructor to create a new XML Compressor object
     * @param {string | string[]} [pathOrPaths] Path or paths to files or folder to compress 
     * @param {string} [sortOrder] Sort order to order the XML elements. Values: simpleFirst, complexFirst, alphabetAsc or alphabetDesc. (alphabetDesc by default)
     */
    constructor(pathOrPaths?: string | string[], sortOrder?: string) {
        this.paths = pathOrPaths ? XMLUtils.forceArray(pathOrPaths) : [];
        this.sortOrder = (sortOrder && Object.values(SORT_ORDER).includes(sortOrder)) ? sortOrder : SORT_ORDER.ALPHABET_DESC;
        this.content = undefined;
        this.xmlRoot = undefined;

        this._xmlDefinition = undefined;
        this._compressedContent = undefined;
        this._event = new EventEmitter();
    }

    /**
     * Method to handle when a file compression failed. The callback method will be execute with any file compression error when execute compress() method.
     * @param {Function} onFailedCallback Callback function to handle the event
     * 
     * @returns {XMLCompressor} Return the XMLCompressor instance
     */
    onCompressFailed(onFailedCallback: (status: XMLCompressorStatus) => void): XMLCompressor {
        this._event.on(ON_COMPRESS_FAILED, onFailedCallback);
        return this;
    }

    /**
     * Method to handle when a file compressed succesfully. The callback method will be execute with any compressed file when execute compress() method.
     * @param {Function} onSuccessCallback Callback function to handle the event
     * 
     * @returns {XMLCompressor} Return the XMLCompressor instance
     */
    onCompressSuccess(onSuccessCallback: (status: XMLCompressorStatus) => void): XMLCompressor {
        this._event.on(ON_COMPRESS_SUCCESS, onSuccessCallback);
        return this;
    }

    /**
     * Method to set the file or folder path or paths to execute compressor operations
     * @param {string | string[]} pathOrPaths Path or paths to files or folder to compress 
     * 
     * @returns {XMLCompressor} Return the XMLCompressor instance
     */
    setPaths(pathOrPaths: string | string[]): XMLCompressor {
        if (!this.paths) {
            this.paths = [];
        }
        this.paths = XMLUtils.forceArray(pathOrPaths);
        return this;
    }

    /**
     * Method to add a file or folder path or paths to execute compressor operations
     * @param {string | string[]} pathOrPaths Path or paths to files or folder to compress 
     * 
     * @returns {XMLCompressor} Return the XMLCompressor instance
     */
    addPaths(pathOrPaths: string | string[]): XMLCompressor {
        if (!this.paths) {
            this.paths = [];
        }
        if (pathOrPaths) {
            pathOrPaths = XMLUtils.forceArray(pathOrPaths);
            this.paths = this.paths.concat(pathOrPaths);
        }
        return this;
    }

    /**
     * Method to set a XML string content to execute compressor operations (except compress() and compressSync() and methods because only work with file or folder paths)
     * @param {string} content string XML content to compress. 
     * 
     * @returns {XMLCompressor} Return the XMLCompressor instance
     */
    setContent(content: string): XMLCompressor {
        this.content = content;
        return this;
    }

    /**
     * Method to set the XML Parsed object to execute compressor operations (except compress() and compressSync() and methods because only work with file or folder paths) (Usgin XMLParser from @aurahelper/languages module)
     * @param {any} xmlRoot XML Parsed object with XMLParser from languages module
     * 
     * @returns {XMLCompressor} Return the XMLCompressor instance
     */
    setXMLRoot(xmlRoot: any): XMLCompressor {
        this.xmlRoot = xmlRoot;
        return this;
    }

    /**
     * Method to set the sort order value to sort the XML Elements when compress
     * @param {string} sortOrder Sort order to order the XML elements. Values: simpleFirst, complexFirst, alphabetAsc or alphabetDesc. (alphabetDesc by default).
     * 
     * @returns {XMLCompressor} Return the XMLCompressor instance
     */
    setSortOrder(sortOrder: string): XMLCompressor {
        this.sortOrder = (sortOrder && Object.values(SORT_ORDER).includes(sortOrder)) ? sortOrder : SORT_ORDER.ALPHABET_DESC;
        return this;
    }

    /**
     * Method to set Simple XML Elements first as sort order (simpleFirst)
     * @returns {XMLCompressor} Return the XMLCompressor instance
     */
    sortSimpleFirst(): XMLCompressor {
        this.sortOrder = SORT_ORDER.SIMPLE_FIRST;
        return this;
    }

    /**
     * Method to set Complex XML Elements first as sort order (complexFirst)
     * @returns {XMLCompressor} Return the XMLCompressor instance
     */
    sortComplexFirst(): XMLCompressor {
        this.sortOrder = SORT_ORDER.COMPLEX_FIRST;
        return this;
    }

    /**
     * Method to set Alphabet Asc as sort order (alphabetAsc)
     * @returns {XMLCompressor} Return the XMLCompressor instance
     */
    sortAlphabetAsc(): XMLCompressor {
        this.sortOrder = SORT_ORDER.ALPHABET_ASC;
        return this;
    }

    /**
     * Method to set Alphabet Desc as sort order (alphabetDesc)
     * @returns {XMLCompressor} Return the XMLCompressor instance
     */
    sortAlphabetDesc(): XMLCompressor {
        this.sortOrder = SORT_ORDER.ALPHABET_DESC;
        return this;
    }

    /**
     * Method to get the XML compressed content from a file path, string content or XMLRoot object on sync mode.
     * XMLRoot object has priority over string content to be processed, and string content priority over path. For example, if you pass content and XMLRoot object to compressor, this method will be run with the XMLRoot data.
     * @returns {string} Returns a string with the compressed content
     * 
     * @throws {OperationNotSupportedException} If the file does not support compression
     * @throws {OperationNotAllowedException} If the file path is a folder path
     * @throws {DataNotFoundException} If has no paths, content or XML Root to process
     * @throws {WrongFilePathException} If the file Path is not a string or can't convert to absolute path
     * @throws {FileNotFoundException} If the file not exists or not have access to it
     * @throws {InvalidFilePathException} If the path is not a file
     */
    getCompressedContentSync(): string {
        if (this._compressedContent) {
            return this._compressedContent;
        }
        if (!this.content && !this.xmlRoot) {
            if (this.paths.length > 1) {
                throw new OperationNotAllowedException('Can\'t get compressed content from more than one file');
            } else if (!this.paths || this.paths.length === 0) {
                throw new DataNotFoundException('Not path, content or XML Root to get the compressed XML content');
            } else if (FileChecker.isDirectory(this.paths[0])) {
                throw new OperationNotAllowedException('Can\'t get compressed content from a directory. Select a single file');
            }
            this.paths[0] = Validator.validateFilePath(this.paths[0]);
            this.content = FileReader.readFileSync(this.paths[0]);
        }
        if (!this.xmlRoot) {
            this.xmlRoot = XMLParser.parseXML(this.content, true);
        }
        const type = Object.keys(this.xmlRoot)[0];
        if (!this._xmlDefinition) {
            this._xmlDefinition = XMLDefinitions.getRawDefinition(type);
        }
        const xmlData = XMLUtils.cleanXMLFile(this._xmlDefinition, this.xmlRoot[type]);
        if (xmlData === undefined) {
            throw new OperationNotSupportedException('The selected XML content of MetadataType ' + type + ' does not support compression');
        }
        this._compressedContent = processXMLData(type, xmlData, this._xmlDefinition, this.sortOrder);
        return this._compressedContent;
    }

    /**
     * Method to get the XML compressed content from a file path, string content or XMLRoot object on async mode.
     * XMLRoot object has priority over string content to be processed, and string content priority over path. For example, if you pass content and XMLRoot object to compressor, this method will be run with the XMLRoot data.
     * @returns {Promise<string>} Returns a string Promise with the compressed content
     * 
     * @throws {OperationNotSupportedException} If the file does not support compression
     * @throws {OperationNotAllowedException} If the file path is a folder path
     * @throws {DataNotFoundException} If has no paths, content or XML Root to process
     * @throws {WrongFilePathException} If the file Path is not a string or can't convert to absolute path
     * @throws {FileNotFoundException} If the file not exists or not have access to it
     * @throws {InvalidFilePathException} If the path is not a file
     */
    getCompressedContent(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            try {
                if (this._compressedContent) {
                    resolve(this._compressedContent);
                    return;
                }
                if (!this.content && !this.xmlRoot) {
                    if (this.paths.length > 1) {
                        throw new OperationNotAllowedException('Can\'t get compressed content from more than one file');
                    } else if (!this.paths || this.paths.length === 0) {
                        throw new DataNotFoundException('Not path, content or XML Root to get the compressed XML content');
                    } else if (FileChecker.isDirectory(this.paths[0])) {
                        throw new OperationNotAllowedException('Can\'t get compressed content from a directory. Select a single file');
                    }
                    this.paths[0] = Validator.validateFilePath(this.paths[0]);
                    this.content = FileReader.readFileSync(this.paths[0]);
                }
                if (!this.xmlRoot) {
                    this.xmlRoot = XMLParser.parseXML(this.content, true);
                }
                const type = Object.keys(this.xmlRoot)[0];
                if (!this._xmlDefinition) {
                    this._xmlDefinition = XMLDefinitions.getRawDefinition(type);
                }
                const xmlData = XMLUtils.cleanXMLFile(this._xmlDefinition, this.xmlRoot[type]);
                if (xmlData === undefined) {
                    throw new OperationNotSupportedException('The selected XML content of MetadataType ' + type + ' does not support compression');
                }
                this._compressedContent = processXMLData(type, xmlData, this._xmlDefinition, this.sortOrder);
                resolve(this._compressedContent);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Method to get the XML compressed content from a file path on sync mode.
     * 
     * @throws {OperationNotSupportedException} If the file does not support compression
     * @throws {OperationNotAllowedException} If the file path is a folder path
     * @throws {DataNotFoundException} If has no paths to process
     * @throws {WrongFilePathException} If the file Path is not a string or can't convert to absolute path
     * @throws {FileNotFoundException} If the file not exists or not have access to it
     * @throws {InvalidFilePathException} If the path is not a file
     */
    compressSync(): void {
        if (this.paths.length > 1) {
            throw new OperationNotAllowedException('Can\'t compress more than one file on sync mode. Execute compress() method compress several files');
        } else if (!this.paths || this.paths.length === 0) {
            throw new DataNotFoundException('Has no paths to get the compressed XML content');
        } else if (FileChecker.isDirectory(this.paths[0])) {
            throw new OperationNotAllowedException('Can\'t compress directory on sync mode. Execute compress() method to compress entire directory');
        }
        this.paths[0] = Validator.validateFilePath(this.paths[0]);
        this.content = FileReader.readFileSync(this.paths[0]);
        this.xmlRoot = XMLParser.parseXML(this.content, true);
        const type = Object.keys(this.xmlRoot)[0];
        this._xmlDefinition = XMLDefinitions.getRawDefinition(type);
        const xmlData = XMLUtils.cleanXMLFile(this._xmlDefinition, this.xmlRoot[type]);
        if (xmlData === undefined) {
            throw new OperationNotSupportedException('The selected XML content of MetadataType ' + type + ' does not support compression');
        }
        this._compressedContent = processXMLData(type, xmlData, this._xmlDefinition, this.sortOrder);
        FileWriter.createFileSync(this.paths[0], this._compressedContent);
    }

    /**
     * Method to compress a XML File, a List of files or entire folder (and subfolders) in Async mode. This methods fire some events to handle compress progress.
     * Use onCompressFailed() and onCompressSuccess() methods to handling progress.
     * 
     * @returns {Promise<void>} Returns an empty Promise
     * 
     * @throws {OperationNotSupportedException} If try to compress more than one folder, or file and folders at the same time
     * @throws {DataNotFoundException} If has no paths to process
     * @throws {WrongFilePathException} If the file Path is not a string or can't convert to absolute path
     * @throws {FileNotFoundException} If the file not exists or not have access to it
     * @throws {InvalidFilePathException} If the path is not a file
     * @throws {WrongDirectoryPathException} If the folder Path is not a string or cant convert to absolute path
     * @throws {DirectoryNotFoundException} If the directory not exists or not have access to it
     * @throws {InvalidDirectoryPathException} If the path is not a directory
     */
    compress(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            try {
                const pathsToCompress = [];
                let nFiles = 0;
                let nFolders = 0;
                for (const path of this.paths) {
                    if (FileChecker.isFile(path)) {
                        nFiles++;
                        pathsToCompress.push(Validator.validateFilePath(path));
                    } else {
                        nFolders++;
                        pathsToCompress.push(Validator.validateFolderPath(path));
                    }
                }
                if (nFiles === 0 && nFolders === 0) {
                    throw new DataNotFoundException('Not files or folders selected to compress');
                } else if (nFiles > 0 && nFolders > 0) {
                    throw new OperationNotSupportedException('Can\'t compress files and folders at the same time. Please, add only folders or files to compress');
                } else if (nFolders > 1) {
                    throw new OperationNotSupportedException('Can\'t compress more than one folder at the same time.');
                }
                let files;
                if (nFolders === 1) {
                    files = await FileReader.getAllFiles(pathsToCompress[0], ['.xml']);
                } else {
                    files = pathsToCompress;
                }
                Utils.sort(files);
                const totalFiles = files.length;
                let filesProcessed = 0;
                let oldType;
                let xmlDefinition;
                for (const file of files) {
                    try {
                        const xmlRoot = XMLParser.parseXML(FileReader.readFileSync(file), true);
                        const type = Object.keys(xmlRoot)[0];
                        if (!xmlDefinition || type !== oldType) {
                            xmlDefinition = XMLDefinitions.getRawDefinition(type);
                        }
                        oldType = type;
                        const xmlData = XMLUtils.cleanXMLFile(xmlDefinition, xmlRoot[type]);
                        if (xmlData === undefined) {
                            throw new OperationNotSupportedException('The selected XML content of MetadataType ' + type + ' does not support compression');
                        }
                        const xmlContent = processXMLData(type, xmlData, xmlDefinition, this.sortOrder);
                        FileWriter.createFileSync(file, xmlContent);
                        filesProcessed++;
                        this._event.emit(ON_COMPRESS_SUCCESS, {
                            file: file,
                            filesProcessed: filesProcessed,
                            totalFiles: totalFiles
                        });
                    } catch (error) {
                        filesProcessed++;
                        this._event.emit(ON_COMPRESS_FAILED, {
                            file: file,
                            filesProcessed: filesProcessed,
                            totalFiles: totalFiles
                        });
                    }
                }
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Method to get the Sort Order values object
     * @returns {XMLSortOrder} Return and object with the available sort order values
     */
    static getSortOrderValues(): XMLSortOrder {
        return SORT_ORDER;
    }
}

function processXMLData(type: string, xmlData: any, xmlDefinition: any, sortOrder: string) {
    let content = XMLParser.getXMLFirstLine() + NEWLINE;
    let attributes = XMLUtils.getAttributes(xmlData);
    let indent = 0;
    let objectKeys = getOrderedKeys(xmlDefinition, sortOrder);
    content += XMLParser.getStartTag(type, attributes) + NEWLINE;
    try {
        if (objectKeys) {
            for (let key of objectKeys) {
                const fieldValue = xmlData[key];
                if (fieldValue !== undefined) {
                    if (!Array.isArray(fieldValue) && typeof fieldValue === 'object' && Object.keys(fieldValue).length === 0) {
                        continue;
                    }
                    if (Array.isArray(fieldValue) && fieldValue.length === 0) {
                        continue;
                    }
                    const fieldDefinition = xmlDefinition[key];
                    content += processXMLField(xmlDefinition, fieldDefinition, fieldValue, sortOrder, indent + 1);
                }
            }
        }
    } catch (error) {
        throw error;
    }
    content += XMLParser.getEndTag(type);
    return content;
}

function processXMLField(typeDefinition: any, fieldDefinition: any, fieldValue: any, sortOrder: string, indent: number) {
    let content = '';
    if (mustCompress(fieldDefinition)) {
        if (isComplexField(fieldDefinition)) {
            let objectKeys = getOrderedKeys(fieldDefinition, sortOrder);
            if (Array.isArray(fieldValue) || fieldDefinition.datatype === Datatypes.ARRAY) {
                fieldValue = XMLUtils.forceArray(fieldValue);
                if (fieldDefinition.sortOrder !== undefined) {
                    XMLUtils.sort(fieldValue, fieldDefinition.sortOrder);
                }
                for (let value of fieldValue) {
                    content += XMLUtils.getTabs(indent) + XMLParser.getStartTag(fieldDefinition.key, XMLUtils.getAttributes(fieldValue));
                    if (objectKeys) {
                        for (let key of objectKeys) {
                            const subFieldValue = value[key];
                            if (subFieldValue !== undefined && subFieldValue !== null) {
                                if (!Array.isArray(subFieldValue) && typeof subFieldValue === 'object' && Object.keys(subFieldValue).length === 0) {
                                    continue;
                                }
                                if (Array.isArray(subFieldValue) && subFieldValue.length === 0) {
                                    continue;
                                }
                                let subFieldDefinition = fieldDefinition.fields[key];
                                if (subFieldDefinition.definitionRef) {
                                    subFieldDefinition = XMLDefinitions.resolveDefinitionReference(typeDefinition, subFieldDefinition);
                                }
                                if (subFieldDefinition.datatype === Datatypes.OBJECT) {
                                    content += processXMLField(typeDefinition, subFieldDefinition, subFieldValue, sortOrder, 0);
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
                if (empty) {
                    content += NEWLINE;
                }
                if (!empty) {
                    if (objectKeys) {
                        for (let key of objectKeys) {
                            const subFieldValue = fieldValue[key];
                            if (subFieldValue !== undefined && subFieldValue !== null) {
                                if (!Array.isArray(subFieldValue) && typeof subFieldValue === 'object' && Object.keys(subFieldValue).length === 0) {
                                    continue;
                                }
                                if (Array.isArray(subFieldValue) && subFieldValue.length === 0) {
                                    continue;
                                }
                                let subFieldDefinition = fieldDefinition.fields[key]; {
                                    if (subFieldDefinition.definitionRef) {
                                        subFieldDefinition = XMLDefinitions.resolveDefinitionReference(typeDefinition, subFieldDefinition);
                                    }
                                }
                                content += XMLParser.getXMLElement(subFieldDefinition.key, XMLUtils.getAttributes(subFieldValue), subFieldDefinition.prepareValue(subFieldValue));
                            }
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
        if (Array.isArray(fieldValue) || fieldDefinition.datatype === Datatypes.ARRAY) {
            fieldValue = XMLUtils.forceArray(fieldValue);
            if (fieldDefinition.sortOrder !== undefined) {
                XMLUtils.sort(fieldValue, fieldDefinition.sortOrder);
            }
            for (let value of fieldValue) {
                if (!objectKeys) {
                    content += XMLUtils.getTabs(indent) + XMLParser.getStartTag(fieldDefinition.key, XMLUtils.getAttributes(fieldValue)) + fieldDefinition.prepareValue(value) + XMLParser.getEndTag(fieldDefinition.key) + NEWLINE;
                } else {
                    content += XMLUtils.getTabs(indent) + XMLParser.getStartTag(fieldDefinition.key, XMLUtils.getAttributes(fieldValue)) + NEWLINE;
                    for (let key of objectKeys) {
                        const subFieldValue = value[key];
                        if (subFieldValue !== undefined && subFieldValue !== null) {
                            if (!Array.isArray(subFieldValue) && typeof subFieldValue === 'object' && Object.keys(subFieldValue).length === 0) {
                                continue;
                            }
                            if (Array.isArray(subFieldValue) && subFieldValue.length === 0) {
                                continue;
                            }
                            let subFieldDefinition = fieldDefinition.fields[key];
                            if (subFieldDefinition.definitionRef) {
                                subFieldDefinition = XMLDefinitions.resolveDefinitionReference(typeDefinition, subFieldDefinition);
                            }
                            content += processXMLField(typeDefinition, subFieldDefinition, subFieldValue, sortOrder, indent + 1);
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
                    if (objectKeys) {
                        for (let key of objectKeys) {
                            const subFieldValue = fieldValue[key];
                            if (subFieldValue !== undefined && subFieldValue !== null) {
                                if (!Array.isArray(subFieldValue) && typeof subFieldValue === 'object' && Object.keys(subFieldValue).length === 0) {
                                    continue;
                                }
                                if (Array.isArray(subFieldValue) && subFieldValue.length === 0) {
                                    continue;
                                }
                                let subFieldDefinition = fieldDefinition.fields[key];
                                if (subFieldDefinition.definitionRef) {
                                    subFieldDefinition = XMLDefinitions.resolveDefinitionReference(typeDefinition, subFieldDefinition);
                                }
                                content += processXMLField(typeDefinition, subFieldDefinition, subFieldValue, sortOrder, indent + 1);
                            }
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

function mustCompress(field: any): boolean {
    let compress = false;
    if (isComplexField(field)) {
        if (field.compress) {
            compress = true;
        } else {
            if (field.fields) {
                compress = true;
                for (let key of Object.keys(field.fields)) {
                    if (isComplexField(field.fields[key])) {
                        compress = false;
                        break;
                    }
                }
            }
        }
    } else {
        compress = true;
    }
    return compress;
}

function getOrderedKeys(xmlEntity: any, sortOrder: string): string[] | undefined {
    let entityKeys: string[];
    if (isComplexField(xmlEntity)) {
        if (xmlEntity.fields) {
            xmlEntity = xmlEntity.fields;
        } else {
            return undefined;
        }
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

function isComplexField(xmlField: any): boolean {
    return xmlField.datatype === Datatypes.ARRAY || xmlField.datatype === Datatypes.OBJECT;
}