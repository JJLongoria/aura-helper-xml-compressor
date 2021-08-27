# **Aura Helper XML Compressor Module**
Module to compress any Salesforce Metadata XML Files to change the format. This module make easy the work with GIT and other Version Control Systems because grant always the same order of the elements, compress the file for ocuppy less storage and make GIT faster and, specially make merges conflict more easy to resolve because identify the changes better.

You can choose the sort order of the elements to reorganize the XML data as you like.

This library depends on [@ah/xml-definitions](https://github.com/JJLongoria/aura-helper-xml-definitions) and support the same versions.


# [**XMLcompressor Class**](#xmlcompressor-class)
Class to compress any Salesforce Metadata XML Files to change the format to make easy the work with GIT or another Version Control Systems because grant always the same order of the elements, compress the file for ocuppy less storage and make GIT faster and, specially make merges conflict more easy to resolve because identify the changes better. 

You can choose the sort order of the elements to reorganize the XML data as you like. 

The setters methods are defined like a builder pattern to make it more usefull

### *Class Members*
- [**Fields**](#fields)

- [**Constructors**](#constructors)

- [**Methods**](#methods)

</br>

# [**Fields**](#fields)
The fields that start with _ are for internal use only (Does not modify this fields to a correct CLI Manager work). To the rest of fields, setter methods are recommended instead modify fields.

### [**paths**](#xmlcompressor-fields-paths)
File or folder path or paths to execute compress operations
- Array\<String\>

### [**sortOrder**](#xmlcompressor-fields-sortorder)
Sort order to order the XML elements. Values: simpleFirst, complexFirst, alphabetAsc or alphabetDesc. (alphabetDesc by default)
- String

### [**content**](#xmlcompressor-fields-content)
String XML content to compress
- String

### [**xmlRoot**](#xmlcompressor-fields-xmlroot)
XML Parsed object with XMLParser from languages module
- Object


</br>

# [**Constructors**](#constructors)

## [**constructor(pathOrPaths, sortOrder)**](#xmlcompressor-class-constructors-construct)
Constructor to create a new XML Compressor object. All parameters are optional and you can use the setters methods to set the values when you want.

### **Parameters:**
  - **pathOrPaths**: Path or paths to files or folder to compress
    - String | Array\<String\>
  - **sortOrder**: Sort order to order the XML elements. Values: simpleFirst, complexFirst, alphabetAsc or alphabetDesc. (alphabetDesc by default)
    - String

</br>

# [**Methods**](#methods)

  - [**onCompressFailed(onFailedCallback)**](#oncompressfailedonfailedcallback)

    Method to handle when a file compression failed. The callback method will be execute with any file compression error when execute compress() method.

  - [**onCompressSuccess(onSuccessCallback)**](#oncompresssuccessonsuccesscallback)

    Method to handle when a file compressed succesfully. The callback method will be execute with any compressed file when execute compress() method.

  - [**setPaths(pathOrPaths)**](#setpathspathorpaths)

    Method to set the file or folder path or paths to execute compressor operations

  - [**addPaths(pathOrPaths)**](#addpathspathorpaths)

    Method to add a file or folder path or paths to execute compressor operations

  - [**setContent(content)**](#setcontentcontent)

    Method to set a XML String content to execute compressor operations (except compress() and compressSync() and methods because only work with file or folder paths)

  - [**setXMLRoot(xmlRoot)**](#setxmlrootxmlroot)

    Method to set the XML Parsed object to execute compressor operations (except compress() and compressSync() and methods because only work with file or folder paths) (Usgin XMLParser from @ah/languages module)

  - [**setSortOrder(sortOrder)**](#setsortordersortorder)

    Method to set the sort order value to sort the XML Elements when compress

  - [**sortSimpleFirst()**](#sortsimplefirst)

    Method to set Simple XML Elements first as sort order (simpleFirst)

  - [**sortComplexFirst()**](#sortcomplexfirst)

    Method to set Complex XML Elements first as sort order (complexFirst)

  - [**sortAlphabetAsc()**](#sortalphabetasc)

    Method to set Alphabet Asc as sort order (alphabetAsc)

  - [**sortAlphabetDesc()**](#sortalphabetdesc)

    Method to set Alphabet Desc as sort order (alphabetDesc)

  - [**getCompressedContentSync(filePathOrXMLRoot, sortOrder)**](#getcompressedcontentsyncfilepathorxmlroot-sortorder)
  
    Method to get the compressed content fron a file on Sync Mode

  - [**getCompressedContent(filePathOrXMLRoot, sortOrder)**](#getcompressedcontentfilepathorxmlroot-sortorder)

    Method to get the XML Content compressed and ordered in Async mode

  - [**compressSync(filePath, sortOrder)**](#compresssyncfilepath-sortorder)

    Method to compress a single XML file in Sync mode

  - [**compress(pathOrPaths, sortOrder, callback)**](#compresspathorpaths-sortorder-callback)

    Method to compress a XML File, a List of files or entire folder (and subfolders) in Async mode

 - [**getSortOrderValues()**](#getsortordervalues)

    Method to get the Sort Order values object

---
## [**onCompressFailed(onFailedCallback)**](#oncompressfailedonfailedcallback)
Method to handle when a file compression failed. The callback method will be execute with any file compression error when execute compress() method.

### **Parameters:**
  - **onFailedCallback**: Callback function to handle the event
    - Function 

### **Return:**
Return the XMLCompressor instance
- XMLCompressor

### **Examples:**
**Handle failed XML compression**
    const XMLCompressor = require('@ah/xml-compressor');

    const compressor = new XMLCompressor('path/to/the/folder');

    compressor.onCompressFailed((data) => {
        console.log(data.file);
        console.log(data.processedFiles);
        console.log(data.totalFiles);
    });

    XMLCompressor.compress().then(function(){
         // handle success
    }).catch(function(){
        // handler error
    });
---

## [**onCompressSuccess(onSuccessCallback)**](#oncompresssuccessonsuccesscallback)
Method to handle when a file compressed succesfully. The callback method will be execute with any compressed file when execute compress() method.

### **Parameters:**
  - **onSuccessCallback**: Callback function to handle the event
    - Function 

### **Return:**
Return the XMLCompressor instance
- XMLCompressor

### **Examples:**
**Handle success XML compression**
    const XMLCompressor = require('@ah/xml-compressor');

    const compressor = new XMLCompressor('path/to/the/folder');

    compressor.onCompressSuccess((data) => {
        console.log(data.file);
        console.log(data.processedFiles);
        console.log(data.totalFiles);
    });

    XMLCompressor.compress().then(function(){
         // handle success
    }).catch(function(){
        // handler error
    });
---
## [**setPaths(pathOrPaths)**](#setpathspathorpaths)
Method to set the file or folder path or paths to execute compressor operations
### **Parameters:**
  - **pathOrPaths**: Path or paths to files or folder to compress 
    - String | Array\<String\> 

### **Return:**
Return the XMLCompressor instance
- XMLCompressor

### **Examples:**
**Set one path to compress**
    const XMLCompressor = require('@ah/xml-compressor');

    const compressor = new XMLCompressor();
    compressor.setPaths('set/only/one/path');

**Set several paths to compress**
    const XMLCompressor = require('@ah/xml-compressor');

    const paths = [
        'path/to/compress/file1.xml',
        'path/to/compress/file2.xml',
        'path/to/compress/file3.xml',
        'path/to/compress/file4.xml',
        'path/to/compress/file5.xml'
    ];

    const compressor = new XMLCompressor();
    compressor.setPaths(paths);
---

## [**addPaths(pathOrPaths)**](#addpathspathorpaths)
Method to add a file or folder path or paths to execute compressor operations

### **Parameters:**
  - **pathOrPaths**: Path or paths to files or folder to compress 
    - String | Array\<String\> 

### **Return:**
Return the XMLCompressor instance
- XMLCompressor

### **Examples:**
**Add one path to compress**
    const XMLCompressor = require('@ah/xml-compressor');

    const compressor = new XMLCompressor();
    compressor.addPaths('set/only/one/path');

**Add several paths to compress**
    const XMLCompressor = require('@ah/xml-compressor');

    const paths = [
        'path/to/compress/file1.xml',
        'path/to/compress/file2.xml',
        'path/to/compress/file3.xml',
        'path/to/compress/file4.xml',
        'path/to/compress/file5.xml'
    ];

    const compressor = new XMLCompressor();
    compressor.addPaths(paths).addPaths('add/another/path/or/paths');
---
## [**setContent(content)**](#setcontentcontent)
Method to set a XML String content to execute compressor operations (except compress() and compressSync() and methods because only work with file or folder paths)

### **Parameters:**
  - **content**: String XML content to compress 
    - String

### **Return:**
Return the XMLCompressor instance
- XMLCompressor

### **Examples:**
**Set XML Content to process**
    const XMLCompressor = require('@ah/xml-compressor');
    
    const xmlContent = '<?xml version...';

    const compressor = new XMLCompressor();
    compressor.setContent(xmlContent);
---

## [**setXMLRoot(xmlRoot)**](#setxmlrootxmlroot)
Method to set the XML Parsed object to execute compressor operations (except compress() and compressSync() and methods because only work with file or folder paths) (Usgin XMLParser from @ah/languages module)

### **Parameters:**
  - **xmlRoot**: XML Parsed object with XMLParser from languages module
    - Object

### **Return:**
Return the XMLCompressor instance
- XMLCompressor

### **Examples:**
**Set XML Root Object to process**
    const { XMLParser } = require('@ah/languages').XML;
    const XMLCompressor = require('@ah/xml-compressor');
    
    const xmlContent = '<?xml version...';
    const xmlRoot = XMLParser.parse(xmlContent);

    const compressor = new XMLCompressor();
    compressor.setXMLRoot(xmlRoot);
---

## [**setSortOrder(sortOrder)**](#setsortordersortorder)
Method to set the sort order value to sort the XML Elements when compress

### **Parameters:**
  - **sortOrder**: Sort order to order the XML elements. Values: simpleFirst, complexFirst, alphabetAsc or alphabetDesc. (alphabetDesc by default).
    - String

### **Return:**
Return the XMLCompressor instance
- XMLCompressor

### **Examples:**
**Set Sort order to order XML Elements**
    const XMLCompressor = require('@ah/xml-compressor');
    
    const sortOrder = XMLCompressor.getSortOrderValues();
    const compressor = new XMLCompressor();
    compressor.setSortOrder(sortOrder.SIMPLE_FIRST);
---

## [**sortSimpleFirst()**](#sortsimplefirst)
Method to set Simple XML Elements first as sort order (simpleFirst)

### **Return:**
Return the XMLCompressor instance
- XMLCompressor


### **Examples:**
**Set Simple first sort order to order XML Elements**
    const XMLCompressor = require('@ah/xml-compressor');
    
    const sortOrder = XMLCompressor.getSortOrderValues();
    const compressor = new XMLCompressor();
    compressor.addPaths('file/to/compress.xml').sortSimpleFirst();
---

## [**sortComplexFirst()**](#sortcomplexfirst)
Method to set Complex XML Elements first as sort order (complexFirst)

### **Return:**
Return the XMLCompressor instance
- XMLCompressor


### **Examples:**
**Set Complex first sort order to order XML Elements**
    const XMLCompressor = require('@ah/xml-compressor');
    
    const sortOrder = XMLCompressor.getSortOrderValues();
    const compressor = new XMLCompressor();
    compressor.addPaths('file/to/compress.xml').sortComplexFirst();
---

## [**sortAlphabetAsc()**](#sortalphabetasc)
Method to set Alphabet Asc as sort order (alphabetAsc)

### **Return:**
Return the XMLCompressor instance
- XMLCompressor


### **Examples:**
**Set Alphabet asc sort order to order XML Elements**
    const XMLCompressor = require('@ah/xml-compressor');
    
    const sortOrder = XMLCompressor.getSortOrderValues();
    const compressor = new XMLCompressor();
    compressor.addPaths('file/to/compress.xml').sortAlphabetAsc();
---

## [**sortAlphabetDesc()**](#sortalphabetdesc)
Method to set Alphabet Desc as sort order (alphabetDesc)

### **Return:**
Return the XMLCompressor instance
- XMLCompressor


### **Examples:**
**Set Alphabet desc sort order to order XML Elements**
    const XMLCompressor = require('@ah/xml-compressor');
    
    const sortOrder = XMLCompressor.getSortOrderValues();
    const compressor = new XMLCompressor();
    compressor.addPaths('file/to/compress.xml').sortAlphabetDesc();
---

## [**getCompressedContentSync()**](#getcompressedcontentsync)
Method to get the XML compressed content from a file path, String content or XMLRoot object on sync mode. XMLRoot object has priority over String content to be processed, and String content priority over path. For example, if you pass content and XMLRoot object to compressor, this method will be run with the XMLRoot data.

### **Return:**
Returns an String with the compressed content
- String

### **Throws:**
This method can throw the next exceptions:

- **OperationNotSupportedException**: If the file does not support compression
- **OperationNotAllowedException**: If the file path is a folder path
- **DataNotFoundException**: If has no paths, content or XML Root to process
- **WrongFilePathException**: If the file Path is not a String or can't convert to absolute path
- **FileNotFoundException**: If the file not exists or not have access to it
- **InvalidFilePathException**: If the path is not a file

### **Examples:**
**Get the file compressed content Sync**

    const XMLCompressor = require('@ah/xml-compressor');

    try{
        const compressor = new XMLCompressor('path/to/the/file');
        let compressedContent = compressor.getCompressedContentSync();
         // handle success
    } catch(error){
        // handle errors
    }

**Get the file compressed content Sync with sort order**

    const XMLCompressor = require('@ah/xml-compressor');

    try{
        const sortOrder = XMLCompressor.getSortOrderValues();
        const compressor = new XMLCompressor('path/to/the/file', sortOrder.SIMPLE_FIRST);
        let compressedContent = compressor.getCompressedContentSync();
         // handle success
    } catch(error){
        // handle errors
    }
---

## [**getCompressedContent()**](#getcompressedcontent)
Method to get the XML Content compressed and ordered in Async mode

### **Return:**
Returns a String Promise with the compressed content
- Promise\<String\>

### **Throws:**
This method can throw the next exceptions:

- **OperationNotSupportedException**: If the file does not support compression
- **OperationNotAllowedException**: If the file path is a folder path
- **DataNotFoundException**: If has no paths, content or XML Root to process
- **WrongFilePathException**: If the file Path is not a String or can't convert to absolute path
- **FileNotFoundException**: If the file not exists or not have access to it
- **InvalidFilePathException**: If the path is not a file

### **Examples:**
**Get the file compressed content Async**

    const XMLCompressor = require('@ah/xml-compressor');
    try{
        const compressor = new XMLCompressor('path/to/the/file');
        compressor.getCompressedContent().then((compressedContent) => {
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
        const sortOrder = XMLCompressor.getSortOrderValues();
        const compressor = new XMLCompressor('path/to/the/file', sortOrder.SIMPLE_FIRST);
        compressor.getCompressedContent().then((compressedContent) => {
            // handle success
        }).catch(function(){
            // handle errors
        });
    } catch(error){
        // handle errors
    }
---

## [**compressSync()**](#compresssync)
Method to compress a single XML file in Sync mode

### **Throws:**
This method can throw the next exceptions:

- **OperationNotSupportedException**: If the file does not support compression
- **OperationNotAllowedException**: If the file path is a folder path
- **DataNotFoundException**: If has no paths to process
- **WrongFilePathException**: If the file Path is not a String or can't convert to absolute path
- **FileNotFoundException**: If the file not exists or not have access to it
- **InvalidFilePathException**: If the path is not a file

### **Examples:**

**Compress a single XML file Sync**

    const XMLCompressor = require('@ah/xml-compressor');

    try{
        const compressor = new XMLCompressor('path/to/the/file');

        compressor.compressSync();
        // handle success
    } catch(error){
        // handle errors
    }

**Compress a single XML file Sync with sort order**

    const XMLCompressor = require('@ah/xml-compressor');

    try{
        const sortOrder = XMLCompressor.getSortOrderValues();
        const compressor = new XMLCompressor('path/to/the/file', sortOrder.SIMPLE_FIRST);
        compressor.compressSync();
        // handle success
    } catch(error){
        // handle errors
    }
---

## [**compress()**](#compress)
Method to compress a XML File, a List of files or entire folder (and subfolders) in Async mode

### **Return:**
Returns an empty promise
- Promise

### **Throws:**
This method can throw the next exceptions:

- **OperationNotSupportedException**: If try to compress more than one folder, or file and folders at the same time
- **DataNotFoundException**: If has no paths to process
- **WrongFilePathException**: If the file Path is not a String or can't convert to absolute path
- **FileNotFoundException**: If the file not exists or not have access to it
- **InvalidFilePathException**: If the path is not a file
- **WrongDirectoryPathException**: If the folder Path is not a String or cant convert to absolute path
- **DirectoryNotFoundException**: If the directory not exists or not have access to it
- **InvalidDirectoryPathException**: If the path is not a directory

### **Examples:**

**Compress a single XML file Async**

    const XMLCompressor = require('@ah/xml-compressor');

    const compressor = new XMLCompressor('path/to/the/file');

    compressor.compress().then(() => {
         // handle success
    }).catch(() => {
        // handler error
    });

**Compress a single XML file Async and Sort Order**

    const XMLCompressor = require('@ah/xml-compressor');

    const sortOrder = XMLCompressor.getSortOrderValues();
    const compressor = new XMLCompressor('path/to/the/file', sortOrder.SIMPLE_FIRST);

    compressor.compress().then(() => {
        // handle success
    }).catch(() => {
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

    const sortOrder = XMLCompressor.getSortOrderValues();
    const compressor = new XMLCompressor(files, sortOrder.SIMPLE_FIRST);

    compressor.compress().then(() => {
         // handle success
    }).catch(() => {
        // handler error
    });

**Compress all XML files from folder Async with Sort Order and Progress Handling**

    const XMLCompressor = require('@ah/xml-compressor');

    const sortOrder = XMLCompressor.getSortOrderValues();
    const compressor = new XMLCompressor(files, sortOrder.SIMPLE_FIRST);

    compressor.onCompressFailed((data) => {
        console.log('File ' + data.file + ' does not support compression');
        console.log('Number of processed files ' + data.processedFiles);
        console.log('Total files to process ' + data.totalFiles);
        console.log('Percentage ' + (data.processedFiles / data.totalFiles) * 100);
    });

    compressor.onCompressFailed((data) => {
        console.log('File ' + data.file + ' compressed succesfully');
        console.log('Number of processed files ' + data.processedFiles);
        console.log('Total files to process ' + data.totalFiles);
        console.log('Percentage ' + (data.processedFiles / data.totalFiles) * 100);
    });

    compressor.compress(folderPath, sortOrder, function(file, compressed){
         // Handler progress
         // file parameter have the file path
         // compressed are a boolean with true value if file compresed and false if not compressed
     }).then(() => {
         // handle success
    }).catch(() => {
        // handler error
    });
---
## [**getSortOrderValues()**](#getsortordervalues)
Method to get the Sort Order values object

### **Return:**
Return and object with the available sort order values
- Object

        {
            SIMPLE_FIRST: 'simpleFirst',
            COMPLEX_FIRST: 'complexFirst',
            ALPHABET_ASC: 'alphabetAsc',
            ALPHABET_DESC: 'alphabetDesc'
        }

The values are:

- **ALPHABET_ASC**: Reorder the XML elements on alphabetical ascending order (a, b, c...). String value: 'alphabetAsc'
- **ALPHABET_DESC**: Reorder the XML elements on alphabetical descending order (z, y, x...). String value: 'alphabetDesc'
- **SIMPLE_FIRST**: Reorder the XML elements when simple elements (Strings, Booleans, Dates, Enums... without nested elements) as first elements (also use alphabetical asc order to order the simple and complex types). String value: 'simpleFirst'
- **COMPLEX_FIRST**: Reorder the XML elements when complex elements (Arrays and Objects with nested elements) as first elements (also use alphabetical asc order to order the simple and complex types). String value: 'complexFirst'