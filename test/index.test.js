const Index = require('../index');
const fs = require('fs');

describe('Testing index.js', () => {
    test('Testing Get Compressed Content Sync', () => {
        let xmlContent = fs.readFileSync('./test/assets/fileUncompressed.xml', 'utf8');
        fs.writeFileSync('./test/assets/result.xml', xmlContent);
        xmlContent = Index.getCompressedContentSync('./test/assets/result.xml', Index.SORT_ORDER.ALPHABET_DESC);
        fs.writeFileSync('./test/assets/result.xml', xmlContent);
        fs.unlinkSync('./test/assets/result.xml');
    });
    test('Testing Get Compressed Content on Folder Sync', () => {
        let xmlContent = fs.readFileSync('./test/assets/fileUncompressed.xml', 'utf8');
        fs.writeFileSync('./test/assets/result.xml', xmlContent);
        try {
            Index.getCompressedContentSync('./test/assets/folderToCompress', Index.SORT_ORDER.ALPHABET_DESC);
        } catch (error) {
            expect(error.message).toMatch('Can\'t get compressed content from a directory. Select a single file');
        }
        fs.writeFileSync('./test/assets/result.xml', xmlContent);
        fs.unlinkSync('./test/assets/result.xml');
    });
    test('Testing Get Compressed Content Async', async (done) => {
        let xmlContent = fs.readFileSync('./test/assets/fileUncompressed.xml', 'utf8');
        fs.writeFileSync('./test/assets/result.xml', xmlContent);
        let compressedContent = await Index.getCompressedContent('./test/assets/result.xml', Index.SORT_ORDER.SIMPLE_FIRST);
        let exampleToCompare = fs.readFileSync('./test/assets/fileCompressed.xml', 'utf8');
        fs.unlinkSync('./test/assets/result.xml');
        expect(exampleToCompare).toMatch(compressedContent);
        done();
    });
    test('Testing Get Compressed Content on Folder Async', (done) => {
        let xmlContent = fs.readFileSync('./test/assets/fileUncompressed.xml', 'utf8');
        fs.writeFileSync('./test/assets/result.xml', xmlContent);
        Index.getCompressedContent('./test/assets/folderToCompress', Index.SORT_ORDER.ALPHABET_DESC).then(() => {
            done();
        }).catch((error) => {
            expect(error.message).toMatch('Can\'t get compressed content from a directory. Select a single file');
            done();
        });
        fs.writeFileSync('./test/assets/result.xml', xmlContent);
        fs.unlinkSync('./test/assets/result.xml');
    });
    test('Testing Get Compressed Content Async File Not Exists', async (done) => {
        let xmlContent = fs.readFileSync('./test/assets/fileUncompressed.xml', 'utf8');
        fs.writeFileSync('./test/assets/result.xml', xmlContent);
        try {
            await Index.getCompressedContent('./test/assets/result1.xml', Index.SORT_ORDER.SIMPLE_FIRST);
        } catch (error) {
            expect(error.message).toContain('does not exists or not have access to it');
        }
        done();
    });
    test('Testing Compress With file and folder', async (done) => {
        let xmlContent = fs.readFileSync('./test/assets/fileUncompressed.xml', 'utf8');
        fs.writeFileSync('./test/assets/result.xml', xmlContent);
        try{
            await Index.compress(['./test/assets/folderNotCompatible', './test/assets/result.xml'], Index.SORT_ORDER.SIMPLE_FIRST, function (file, compressed) {});
        } catch(error){
            expect(error.message).toMatch('Can\'t compress files and folders at the same time. Please, add only folders or files to compress');
        }
        fs.unlinkSync('./test/assets/result.xml');
        done();
    });
    test('Testing Compress With more than one folder', async (done) => {
        let xmlContent = fs.readFileSync('./test/assets/fileUncompressed.xml', 'utf8');
        fs.writeFileSync('./test/assets/result.xml', xmlContent);
        try{
            await Index.compress(['./test/assets/folderNotCompatible', './test/assets/folderToCompress'], Index.SORT_ORDER.SIMPLE_FIRST, function (file, compressed) {});
        } catch(error){
            expect(error.message).toMatch('Can\'t compress more than one folder at the same time');
        }
        fs.unlinkSync('./test/assets/result.xml');
        done();
    });
    test('Testing Compress With any file or folder', async (done) => {
        let nUncompressed = 0;
        let total = 0;
        try{
            await Index.compress([], Index.SORT_ORDER.SIMPLE_FIRST, function (file, compressed) {});
        } catch(error){
            expect(error.message).toMatch('Not files or folders selected to compress');
        }
        done();
    });
    test('Testing Compress File Sync', () => {
        let xmlContent = fs.readFileSync('./test/assets/fileUncompressed.xml', 'utf8');
        fs.writeFileSync('./test/assets/result.xml', xmlContent);
        Index.compressSync('./test/assets/result.xml', Index.SORT_ORDER.SIMPLE_FIRST);
        let compressedContent = fs.readFileSync('./test/assets/result.xml', 'utf8');
        let exampleToCompare = fs.readFileSync('./test/assets/fileCompressed.xml', 'utf8');
        fs.unlinkSync('./test/assets/result.xml');
        expect(exampleToCompare).toMatch(compressedContent);
    });
    test('Testing Compress File Sync Without Sort Order', () => {
        let xmlContent = fs.readFileSync('./test/assets/fileUncompressed.xml', 'utf8');
        fs.writeFileSync('./test/assets/result.xml', xmlContent);
        Index.compressSync('./test/assets/result.xml');
        let compressedContent = fs.readFileSync('./test/assets/result.xml', 'utf8');
        let exampleToCompare = fs.readFileSync('./test/assets/fileCompressed.xml', 'utf8');
        fs.unlinkSync('./test/assets/result.xml');
    });
    test('Testing Compress File Sync File Not Exists', () => {
        let xmlContent = fs.readFileSync('./test/assets/fileUncompressed.xml', 'utf8');
        fs.writeFileSync('./test/assets/result.xml', xmlContent);
        try {
            Index.compressSync('./test/assets/result1.xml', Index.SORT_ORDER.SIMPLE_FIRST);
        } catch (error) {
            expect(error.message).toContain('does not exists or not have access to it');
        }
        fs.unlinkSync('./test/assets/result.xml');
    });
    test('Testing Compress Folder Sync', () => {
        try {
            Index.compressSync('./test/assets/folderToCompress', Index.SORT_ORDER.SIMPLE_FIRST);
        } catch (error) {
            expect(error.message).toContain('Can\'t compress directory on sync mode. Execute compress() method to compress entire directory');
        }
    });
    test('Testing Compress File Async', async (done) => {
        let xmlContent = fs.readFileSync('./test/assets/fileUncompressed.xml', 'utf8');
        fs.writeFileSync('./test/assets/result.xml', xmlContent);
        await Index.compress('./test/assets/result.xml', Index.SORT_ORDER.COMPLEX_FIRST);
        fs.unlinkSync('./test/assets/result.xml');
        done();
    });
    test('Testing Compress File Async File Not Exists', async (done) => {
        try {
            await Index.compress('./test/assets/result1.xml', Index.SORT_ORDER.SIMPLE_FIRST);
        } catch (error) {
            expect(error.message).toContain('does not exists or not have access to it');
        }
        done();
    });
    test('Testing Compress Folder Sync', () => {
        try {
            Index.compressSync('./test/assets/folderToCompress', Index.SORT_ORDER.SIMPLE_FIRST);
        } catch (error) {
            expect(error.message).toMatch('Can\'t compress directory on sync mode. Execute compress() method to compress entire directory');
        }
    });
    test('Testing Compress Folder Async', async (done) => {
        let nCompressed = 0;
        try {
            await Index.compress('./test/assets/folderToCompress', Index.SORT_ORDER.SIMPLE_FIRST, function (file, compressed) {
                nCompressed++;
                if (nCompressed == 2) {
                    expect(2).toEqual(nCompressed);
                    done();
                }
            });
        } catch (error) {
            expect(error.message).toContain('File not found.');
        }
        done();
    });
    test('Testing Compress Folder Async With No Comprimible File', async (done) => {
        let nUncompressed = 0;
        let total = 0;
        await Index.compress('./test/assets/folderNotCompatible', Index.SORT_ORDER.SIMPLE_FIRST, function (file, compressed) {
            if (!compressed)
                nUncompressed++;
            total++;
            if (total == 1) {
                expect(1).toEqual(nUncompressed);
            }
        });
        done();
    });
});