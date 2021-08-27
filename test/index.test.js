const XMLCompressor = require('../index');
const fs = require('fs');

describe('Testing index.js', () => {
    test('Testing Get Compressed Content Sync', () => {
        let xmlContent = fs.readFileSync('./test/assets/fileUncompressed.xml', 'utf8');
        fs.writeFileSync('./test/assets/result.xml', xmlContent);
        const compressor = new XMLCompressor('./test/assets/result.xml');
        compressor.sortAlphabetDesc();
        xmlContent = compressor.getCompressedContentSync();
        fs.writeFileSync('./test/assets/result.xml', xmlContent);
        fs.unlinkSync('./test/assets/result.xml');
    });
    test('Testing Get Compressed Content on Folder Sync', () => {
        let xmlContent = fs.readFileSync('./test/assets/fileUncompressed.xml', 'utf8');
        fs.writeFileSync('./test/assets/result.xml', xmlContent);
        try {
            const compressor = new XMLCompressor('./test/assets/folderToCompress');
            compressor.sortAlphabetDesc();
            xmlContent = compressor.getCompressedContentSync();
        } catch (error) {
            expect(error.message).toMatch('Can\'t get compressed content from a directory. Select a single file');
        }
        fs.writeFileSync('./test/assets/result.xml', xmlContent);
        fs.unlinkSync('./test/assets/result.xml');
    });
    test('Testing Get Compressed Content Async', async (done) => {
        let xmlContent = fs.readFileSync('./test/assets/fileUncompressed.xml', 'utf8');
        fs.writeFileSync('./test/assets/result.xml', xmlContent);
        const compressor = new XMLCompressor('./test/assets/result.xml');
        compressor.sortSimpleFirst();
        let compressedContent = await compressor.getCompressedContent();
        let exampleToCompare = fs.readFileSync('./test/assets/fileCompressed.xml', 'utf8');
        fs.unlinkSync('./test/assets/result.xml');
        expect(exampleToCompare).toMatch(compressedContent);
        done();
    });
    test('Testing Get Compressed Content on Folder Async', (done) => {
        let xmlContent = fs.readFileSync('./test/assets/fileUncompressed.xml', 'utf8');
        fs.writeFileSync('./test/assets/result.xml', xmlContent);
        const compressor = new XMLCompressor('./test/assets/folderToCompress');
        compressor.sortAlphabetAsc();
        compressor.getCompressedContent().then(() => {
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
            const compressor = new XMLCompressor('./test/assets/result1.xml');
            compressor.sortSimpleFirst();
            await compressor.getCompressedContent();
        } catch (error) {
            expect(error.message).toContain('does not exists or not have access to it');
        }
        done();
    });
    test('Testing Compress With file and folder', async (done) => {
        let xmlContent = fs.readFileSync('./test/assets/fileUncompressed.xml', 'utf8');
        fs.writeFileSync('./test/assets/result.xml', xmlContent);
        try {
            const compressor = new XMLCompressor(['./test/assets/folderNotCompatible', './test/assets/result.xml']);
            compressor.sortComplexFirst();
            compressor.onCompressSuccess((status) => {
                console.log('compressed');
                console.log(status);
            });
            compressor.onCompressFailed((status) => {
                console.log('not compressed');
                console.log(status);
            });
            await compressor.getCompressedContent();
            await compressor.compress();
        } catch (error) {
            expect(error.message).toMatch('Can\'t get compressed content from more than one file');
        }
        fs.unlinkSync('./test/assets/result.xml');
        done();
    });
    test('Testing Compress With more than one folder', async (done) => {
        let xmlContent = fs.readFileSync('./test/assets/fileUncompressed.xml', 'utf8');
        fs.writeFileSync('./test/assets/result.xml', xmlContent);
        try {
            const compressor = new XMLCompressor(['./test/assets/folderNotCompatible', './test/assets/folderToCompress']);
            compressor.sortComplexFirst();
            compressor.onCompressSuccess((status) => {
                console.log('compressed');
                console.log(status);
            });
            compressor.onCompressFailed((status) => {
                console.log('not compressed');
                console.log(status);
            });
            await compressor.compress();
        } catch (error) {
            expect(error.message).toMatch('Can\'t compress more than one folder at the same time');
        }
        fs.unlinkSync('./test/assets/result.xml');
        done();
    });
    test('Testing Compress With any file or folder', async (done) => {
        let nUncompressed = 0;
        let total = 0;
        try {
            const compressor = new XMLCompressor();
            compressor.sortComplexFirst();
            await compressor.compress();
        } catch (error) {
            expect(error.message).toMatch('Not files or folders selected to compress');
        }
        done();
    });
    test('Testing Compress File Sync', () => {
        let xmlContent = fs.readFileSync('./test/assets/fileUncompressed.xml', 'utf8');
        fs.writeFileSync('./test/assets/result.xml', xmlContent);
        const compressor = new XMLCompressor('./test/assets/result.xml');
        compressor.sortSimpleFirst();
        compressor.compressSync();
        let compressedContent = fs.readFileSync('./test/assets/result.xml', 'utf8');
        let exampleToCompare = fs.readFileSync('./test/assets/fileCompressed.xml', 'utf8');
        fs.unlinkSync('./test/assets/result.xml');
        expect(exampleToCompare).toMatch(compressedContent);
    });
    test('Testing Compress File Sync Without Sort Order', () => {
        let xmlContent = fs.readFileSync('./test/assets/fileUncompressed.xml', 'utf8');
        fs.writeFileSync('./test/assets/result.xml', xmlContent);
        const compressor = new XMLCompressor('./test/assets/result.xml');
        compressor.sortSimpleFirst();
        compressor.compressSync();
        let compressedContent = fs.readFileSync('./test/assets/result.xml', 'utf8');
        let exampleToCompare = fs.readFileSync('./test/assets/fileCompressed.xml', 'utf8');
        fs.unlinkSync('./test/assets/result.xml');
    });
    test('Testing Compress File Sync File Not Exists', () => {
        let xmlContent = fs.readFileSync('./test/assets/fileUncompressed.xml', 'utf8');
        fs.writeFileSync('./test/assets/result.xml', xmlContent);
        try {
            const compressor = new XMLCompressor('./test/assets/result1.xml');
            compressor.sortSimpleFirst();
            compressor.compressSync();
        } catch (error) {
            expect(error.message).toContain('does not exists or not have access to it');
        }
        fs.unlinkSync('./test/assets/result.xml');
    });
    test('Testing Compress Folder Sync', () => {
        try {
            const compressor = new XMLCompressor('./test/assets/folderToCompress');
            compressor.sortSimpleFirst();
            compressor.compressSync();
        } catch (error) {
            expect(error.message).toContain('Can\'t compress directory on sync mode. Execute compress() method to compress entire directory');
        }
    });
    test('Testing Compress File Async', async (done) => {
        let xmlContent = fs.readFileSync('./test/assets/fileUncompressed.xml', 'utf8');
        fs.writeFileSync('./test/assets/result.xml', xmlContent);
        const compressor = new XMLCompressor('./test/assets/result.xml');
        compressor.sortComplexFirst();
        await compressor.compress();
        fs.unlinkSync('./test/assets/result.xml');
        done();
    });
    test('Testing Compress File Async File Not Exists', async (done) => {
        try {
            const compressor = new XMLCompressor('./test/assets/result1.xml');
            compressor.sortSimpleFirst();
            await compressor.compress();
        } catch (error) {
            expect(error.message).toContain('does not exists or not have access to it');
        }
        done();
    });
    test('Testing Compress Folder Sync', () => {
        try {
            const compressor = new XMLCompressor('./test/assets/folderToCompress');
            compressor.sortSimpleFirst();
            compressor.compressSync();
        } catch (error) {
            expect(error.message).toMatch('Can\'t compress directory on sync mode. Execute compress() method to compress entire directory');
        }
    });
    test('Testing Compress Folder Async', async (done) => {
        try {
            const compressor = new XMLCompressor('./test/assets/folderToCompress');
            compressor.sortSimpleFirst();
            await compressor.compress();
        } catch (error) {
            expect(error.message).toContain('File not found.');
        }
        done();
    });
    test('Testing Compress Folder Async With No Comprimible File', async (done) => {
        const compressor = new XMLCompressor('./test/assets/folderNotCompatible');
        compressor.sortSimpleFirst();
        await compressor.compress();
        done();
    });
});