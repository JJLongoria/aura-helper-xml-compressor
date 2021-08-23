# **Aura Helper XML Compressor Module**
Module to compress any Salesforce Metadata XML Files to change the format. This module make easy the work with GIT and other Version Control Systems because grant always the same order of the elements, compress the file for ocuppy less storage and make GIT faster and, specially make merges conflict more easy to resolve because identify the changes better.

You can choose the sort order of the elements to reorganize the XML data as you like.

This library depends on [@ah/xml-definitions](https://github.com/JJLongoria/aura-helper-xml-definitions) and support the same versions.

# [**Fields**](#xmldefinitions-fields)

- [**SORT_ORDER**](#sort_order)

    Object with the sort order values to sort the XML files
---

## [**SORT_ORDER**](#sort_order)
Object with the sort order values to sort the XML files

    const SORT_ORDER = {
        SIMPLE_FIRST: 'simpleFirst',
        COMPLEX_FIRST: 'complexFirst',
        ALPHABET_ASC: 'alphabetAsc',
        ALPHABET_DESC: 'alphabetDesc'
    }

- **ALPHABET_ASC**: Reorder the XML elements on alphabetical ascending order (a, b, c...). String value: 'alphabetAsc'
- **ALPHABET_DESC**: Reorder the XML elements on alphabetical descending order (z, y, x...). String value: 'alphabetDesc'
- **SIMPLE_FIRST**: Reorder the XML elements when simple elements (Strings, Booleans, Dates, Enums... without nested elements) as first elements (also use alphabetical asc order to order the simple and complex types). String value: 'simpleFirst'
- **COMPLEX_FIRST**: Reorder the XML elements when complex elements (Arrays and Objects with nested elements) as first elements (also use alphabetical asc order to order the simple and complex types). String value: 'complexFirst'


# [**Methods**](#xmldefinitions-methods)

  - [**getCompressedContentSync(filePathOrXMLRoot, sortOrder)**](#getcompressedcontentsyncfilepathorxmlroot-sortorder)
  
    Method to get the compressed content fron a file on Sync Mode

  - [**getCompressedContent(filePathOrXMLRoot, sortOrder)**](#getcompressedcontentfilepathorxmlroot-sortorder)

    Method to get the XML Content compressed and ordered in Async mode

  - [**compressSync(filePath, sortOrder)**](#compresssyncfilepath-sortorder)

    Method to compress a single XML file in Sync mode

  - [**compress(pathOrPaths, sortOrder, callback)**](#compresspathorpaths-sortorder-callback)

    Method to compress a XML File, a List of files or entire folder (and subfolders) in Async mode

---

## [**getCompressedContentSync(filePathOrXMLRoot, sortOrder)**](#getcompressedcontentsyncfilepathorxmlroot-sortorder)
Method to get the compressed content fron a file on Sync Mode.

### **Parameters:**
  - **filePathOrXMLRoot**: File path to compress or Object with XML Data (XMLParser)
    - String | Object 
  - **sortOrder**: Sort order to order the XML elements. Values: simpleFirst, complexFirst, alphabetAsc or alphabetDesc. (alphabetDesc by default)
    - String

### **Return:**
Returns an String with the compressed content
- String

### **Throws:**
This method can throw the next exceptions:

- **OperationNotSupportedException**: If the file does not support compression
- **OperationNotAllowedException**: If the file path is a folder path
- **WrongFilePathException**: If the file Path is not a String or can't convert to absolute path
- **FileNotFoundException**: If the file not exists or not have access to it
- **InvalidFilePathException**: If the path is not a file

### **Examples:**
**Get the file compressed content Sync**

    const XMLCompressor = require('@ah/xml-compressor');

    try{
        const filePath = 'path/to/the/file';
        let compressedContent = XMLCompressor.getCompressedContentSync(filePath);
         // handle success
    } catch(error){
        // handle errors
    }

**Get the file compressed content Sync with sort order**

    const XMLCompressor = require('@ah/xml-compressor');

    try{
        const filePath = 'path/to/the/file';
        const sortOrder = XMLCompressor.SORT_ORDER.SIMPLE_FIRST;
        let compressedContent = XMLCompressor.getCompressedContentSync(filePath, sortOrder);
         // handle success
    } catch(error){
        // handle errors
    }
---

## [**getCompressedContent(filePathOrXMLRoot, sortOrder)**](#getcompressedcontentfilepathorxmlroot-sortorder)
Method to get the XML Content compressed and ordered in Async mode

### **Parameters:**
  - **filePathOrXMLRoot**: File path to compress or Object with XML Data (XMLParser)
    - String | Object 
  - **sortOrder**: Sort order to order the XML elements. Values: simpleFirst, complexFirst, alphabetAsc or alphabetDesc. (alphabetDesc by default)
    - String
  - **callback**: Callback function to handle compress progress
    - Function

### **Return:**
Returns a String Promise with the compressed content
- Promise\<String\>

### **Throws:**
This method can throw the next exceptions:

- **OperationNotSupportedException**: If the file does not support compression
- **OperationNotAllowedException**: If the file path is a folder path
- **WrongFilePathException**: If the file Path is not a String or can't convert to absolute path
- **FileNotFoundException**: If the file not exists or not have access to it
- **InvalidFilePathException**: If the path is not a file

### **Examples:**
**Get the file compressed content Async**

    const XMLCompressor = require('@ah/xml-compressor');
    try{
        const filePath = 'path/to/the/file';
        XMLCompressor.getCompressedContent(filePath).then(function(compressedContent){
            // handle success
        }).catch(function(){
            // handle errors
        });
    } catch(error){
        // handle errors
    }

**Get the file compressed content Async with sort order**

    const XMLCompressor = require('@ah/xml-compressor');
    try{
        const sortOrder = XMLCompressor.SORT_ORDER.ALPHABET_DESC;
        const filePath = 'path/to/the/file';
        XMLCompressor.getCompressedContent(filePath, sortOrder).then(function(compressedContent){
            // handle success
        }).catch(function(){
            // handle errors
        });
    } catch(error){
        // handle errors
    }
---

## [**compressSync(filePath, sortOrder)**](#compresssyncfilepath-sortorder)
Method to compress a single XML file in Sync mode
### **Parameters:**
  - **filePath**: XML File path to compress
    - String 
  - **sortOrder**: Sort order to order the XML elements. Values: simpleFirst, complexFirst, alphabetAsc or alphabetDesc. (alphabetDesc by default)
    - String

### **Throws:**
This method can throw the next exceptions:

- **OperationNotSupportedException**: If the file does not support compression
- **OperationNotAllowedException**: If the file path is a folder path
- **WrongFilePathException**: If the file Path is not a String or can't convert to absolute path
- **FileNotFoundException**: If the file not exists or not have access to it
- **InvalidFilePathException**: If the path is not a file

### **Examples:**

**Compress a single XML file Sync**

    const XMLCompressor = require('@ah/xml-compressor');

    try{
        const filePath = 'path/to/the/file';
        XMLCompressor.compressSync(filePath);
        // handle success
    } catch(error){
        // handle errors
    }

**Compress a single XML file Sync with sort order**

    const XMLCompressor = require('@ah/xml-compressor');

    try{
        const filePath = 'path/to/the/file';
        const sortOrder = XMLCompressor.SORT_ORDER.ALPHABET_DESC;
        XMLCompressor.compressSync(filePath, sortOrder);
        // handle success
    } catch(error){
        // handle errors
    }
---

## [**compress(pathOrPaths, sortOrder, callback)**](#compresspathorpaths-sortorder-callback)
Method to compress a XML File, a List of files or entire folder (and subfolders) in Async mode

### **Parameters:**
  - **pathOrPaths**: File, list of files or folder paths to compress
    - String | Array<String> 
  - **sortOrder**: Sort order to order the XML elements. Values: simpleFirst, complexFirst, alphabetAsc or alphabetDesc. (alphabetDesc by default)
    - String
  - **callback**: Callback function to handle compress progress
    - Function

### **Return:**
Returns an empty promise
- Promise

### **Throws:**
This method can throw the next exceptions:

- **OperationNotSupportedException**: If try to compress more than one folder, or file and folders at the same time
- **DataNotFoundException**: If not found file or folder paths
- **WrongFilePathException**: If the file Path is not a String or can't convert to absolute path
- **FileNotFoundException**: If the file not exists or not have access to it
- **InvalidFilePathException**: If the path is not a file
- **WrongDirectoryPathException**: If the folder Path is not a String or cant convert to absolute path
- **DirectoryNotFoundException**: If the directory not exists or not have access to it
- **InvalidDirectoryPathException**: If the path is not a directory

### **Examples:**

**Compress a single XML file Async**

    const XMLCompressor = require('@ah/xml-compressor');

    const filePath = 'path/to/the/file';
    XMLCompressor.compress(filePath).then(function(){
         // handle success
    }).catch(function(){
        // handler error
    });

**Compress a single XML file Async and Sort Order**

    const XMLCompressor = require('@ah/xml-compressor');

    const filePath = 'path/to/the/file';
    const sortOrder = XMLCompressor.SORT_ORDER.COMPLEX_FIRST;
    XMLCompressor.compress(filePath, sortOrder).then(function(){
        // handle success
    }).catch(function(){
        // handler error
    });

**Compress a list of XML file Async and Sort Order**

    const XMLCompressor = require('@ah/xml-compressor');
    const files = [
        'path/to/the/file1',
        'path/to/the/file2',
        'path/to/the/file3',
        ...,
        ...,
        'path/to/the/fileN'
    ];
    const sortOrder = XMLCompressor.SORT_ORDER.SIMPLE_FIRST;
    XMLCompressor.compress(files, sortOrder).then(function(){
         // handle success
    }).catch(function(){
        // handler error
    });

**Compress all XML files from folder Async with Sort Order and Progress Calback**

    const XMLCompressor = require('@ah/xml-compressor');

    const folderPath = 'path/to/the/folder';
    const sortOrder = XMLCompressor.SORT_ORDER.COMPLEX_FIRST;
    XMLCompressor.compress(folderPath, sortOrder, function(file, compressed){
         // Handler progress
         // file parameter have the file path
         // compressed are a boolean with true value if file compresed and false if not compressed
     }).then(function(){
         // handle success
    }).catch(function(){
        // handler error
    });

**Get the file compressed content Async**

    const XMLCompressor = require('@ah/xml-compressor');

    try{
        XMLCompressor.getCompressedContent('path/to/the/file', XMLCompressor.SORT_ORDER.ALPHABET_DESC).then(function(compressedContent){
            // handle success
        }).catch(function(){
            // handle errors
        });
    } catch(error){
        // handle errors
    }