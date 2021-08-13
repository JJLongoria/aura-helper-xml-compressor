# **Aura Helper XML Compressor Module**
Module to compress any Salesforce Metadata XML Files to change the format. This module make easy the work with GIT and other Version Control Systems because grant always the same order of the elements, compress the file for ocuppy less storage and make GIT faster and, specially make merges conflict more easy to resolve because identify the changes better.

You can choose the sort order of the elements to reorganize the XML data as you like.

This library depends on [@ah/xml-definitions](https://github.com/JJLongoria/aura-helper-xml-definitions) and support the same versions. **Support up to API 51.0 (Spring ’21)**

## **Usage**

**Compress a single XML file Sync**

Method to compress a single file in Sync mode, if you chosse a directory, the method thrown the error: Can't compress directory on sync mode. Execute compress() method to compress entire directory. The default sort order are Alphabet asc.

    const XMLCompressor = require('@ah/xml-compressor');

    try{
        XMLCompressor.compressSync('path/to/the/file');
        // handle success
    } catch(error){
        // handle errors
    }

**Compress a single XML file Async and Sort Order**

Method to compress a single file in Async mode and Simple elements first as Sort order.

    const XMLCompressor = require('@ah/xml-compressor');

     XMLCompressor.compress('path/to/the/file', XMLCompressor.SORT_ORDER.SIMPLE_FIRST).then(function(){
         // handle success
    }).catch(function(){
        // handler error
    });

**Compress a list of XML file Async and Sort Order**

Method to compress a list of files in Async mode and Simple elements first as Sort order. You can't compress files and folders in the same list and can't add more than one folder to compress

    const XMLCompressor = require('@ah/xml-compressor');
    const files = [
        'path/to/the/file1',
        'path/to/the/file2',
        'path/to/the/file3',
        ...,
        ...,
        'path/to/the/fileN'
    ];
    XMLCompressor.compress(files, XMLCompressor.SORT_ORDER.SIMPLE_FIRST).then(function(){
         // handle success
    }).catch(function(){
        // handler error
    });

**Compress all XML files from folder Async with Sort Order and Progress Calback**

Method to compress entire XML files from folder in Async mode and Complex elements first as Sort order. Also have a callback as third parameter to get the file compressed and if compress successfully or not.

    const XMLCompressor = require('@ah/xml-compressor');

     XMLCompressor.compress('path/to/the/file', XMLCompressor.SORT_ORDER.COMPLEX, function(file, compressed){
         // Handler progress
         // file parameter have the file path
         // compressed are a boolean with true value if file compresed and false if not compressed
     }).then(function(){
         // handle success
    }).catch(function(){
        // handler error
    });

**Get the file compressed content Sync**

Method to get the compressed content fron a file on Sync Mode. If yo choose a directory, the method thrown the error: Can't get compressed content from a directory. Select a single file

    const XMLCompressor = require('@ah/xml-compressor');

    try{
        let compressedContent = XMLCompressor.getCompressedContentSync('path/to/the/file');
         // handle success
    } catch(error){
        // handle errors
    }

**Get the file compressed content Async**

Method to get the compressed content fron a file on Async Mode an Alphabed Desc as Sort Order. If yo choose a directory, the method thrown the error: Can't get compressed content from a directory. Select a single file

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

## Sort Order
When compress the XML files, you can chose a sort order for the elements on the file. Available values are:

- **ALPHABET_ASC**: Reorder the XML elements on alphabetical ascending order (a, b, c...). String value: 'alphabetAsc'
- **ALPHABET_DESC**: Reorder the XML elements on alphabetical descending order (z, y, x...). String value: 'alphabetDesc'
- **SIMPLE_FIRST**: Reorder the XML elements when simple elements (Strings, Booleans, Dates, Enums... without nested elements) as first elements (also use alphabetical asc order to order the simple and complex types). String value: 'simpleFirst'
- **COMPLEX_FIRST**: Reorder the XML elements when complex elements (Arrays and Objects with nested elements) as first elements (also use alphabetical asc order to order the simple and complex types). String value: 'complexFirst'
