import { readFileSync, unlinkSync, writeFileSync } from 'fs';
import { XMLCompressor } from '../index';

describe('Testing index.js', () => {
    test('Testing Get Compressed Content Sync', () => {
        let xmlContent = readFileSync('./src/test/assets/fileUncompressed.xml', 'utf8');
        writeFileSync('./src/test/assets/result.xml', xmlContent);
        const compressor = new XMLCompressor('./src/test/assets/result.xml');
        compressor.sortAlphabetDesc();
        xmlContent = compressor.getCompressedContentSync();
        writeFileSync('./src/test/assets/result.xml', xmlContent);
        unlinkSync('./src/test/assets/result.xml');
    });
    test('Testing Get Compressed Content on Folder Sync', () => {
        let xmlContent = readFileSync('./src/test/assets/fileUncompressed.xml', 'utf8');
        writeFileSync('./src/test/assets/result.xml', xmlContent);
        try {
            const compressor = new XMLCompressor('./src/test/assets/folderToCompress');
            compressor.sortAlphabetDesc();
            xmlContent = compressor.getCompressedContentSync();
        } catch (error) {
            expect(error.message).toMatch('Can\'t get compressed content from a directory. Select a single file');
        }
        writeFileSync('./src/test/assets/result.xml', xmlContent);
        unlinkSync('./src/test/assets/result.xml');
    });
    test('Testing Get Compressed Content Async', async () => {
        let xmlContent = readFileSync('./src/test/assets/fileUncompressed.xml', 'utf8');
        writeFileSync('./src/test/assets/result.xml', xmlContent);
        const compressor = new XMLCompressor('./src/test/assets/result.xml');
        compressor.sortSimpleFirst();
        let compressedContent = await compressor.getCompressedContent();
        let exampleToCompare = readFileSync('./src/test/assets/fileCompressed.xml', 'utf8');
        unlinkSync('./src/test/assets/result.xml');
        expect(exampleToCompare).toMatch(compressedContent);
        return;
    });
    test('Testing Get Compressed Content on Folder Async', () => {
        let xmlContent = readFileSync('./src/test/assets/fileUncompressed.xml', 'utf8');
        writeFileSync('./src/test/assets/result.xml', xmlContent);
        const compressor = new XMLCompressor('./src/test/assets/folderToCompress');
        compressor.sortAlphabetAsc();
        compressor.getCompressedContent().then(() => {
            return;
        }).catch((error) => {
            expect(error.message).toMatch('Can\'t get compressed content from a directory. Select a single file');
            return;
        });
        writeFileSync('./src/test/assets/result.xml', xmlContent);
        unlinkSync('./src/test/assets/result.xml');
    });
    test('Testing Get Compressed Content Async File Not Exists', async () => {
        let xmlContent = readFileSync('./src/test/assets/fileUncompressed.xml', 'utf8');
        writeFileSync('./src/test/assets/result.xml', xmlContent);
        try {
            const compressor = new XMLCompressor('./src/test/assets/result1.xml');
            compressor.sortSimpleFirst();
            await compressor.getCompressedContent();
        } catch (error) {
            expect(error.message).toContain('does not exists or not have access to it');
        }
        return;
    });
    test('Testing Compress With file and folder', async () => {
        let xmlContent = readFileSync('./src/test/assets/fileUncompressed.xml', 'utf8');
        writeFileSync('./src/test/assets/result.xml', xmlContent);
        try {
            const compressor = new XMLCompressor(['./src/test/assets/folderNotCompatible', './src/test/assets/result.xml']);
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
        unlinkSync('./src/test/assets/result.xml');
        return;
    });
    test('Testing Compress With more than one folder', async () => {
        let xmlContent = readFileSync('./src/test/assets/fileUncompressed.xml', 'utf8');
        writeFileSync('./src/test/assets/result.xml', xmlContent);
        try {
            const compressor = new XMLCompressor(['./src/test/assets/folderNotCompatible', './src/test/assets/folderToCompress']);
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
        unlinkSync('./src/test/assets/result.xml');
        return;
    });
    test('Testing Compress With any file or folder', async () => {
        let nUncompressed = 0;
        let total = 0;
        try {
            const compressor = new XMLCompressor();
            compressor.sortComplexFirst();
            await compressor.compress();
        } catch (error) {
            expect(error.message).toMatch('Not files or folders selected to compress');
        }
        return;
    });
    test('Testing Compress File Sync', () => {
        let xmlContent = readFileSync('./src/test/assets/fileUncompressed.xml', 'utf8');
        writeFileSync('./src/test/assets/result.xml', xmlContent);
        const compressor = new XMLCompressor('./src/test/assets/result.xml');
        compressor.sortSimpleFirst();
        compressor.compressSync();
        let compressedContent = readFileSync('./src/test/assets/result.xml', 'utf8');
        let exampleToCompare = readFileSync('./src/test/assets/fileCompressed.xml', 'utf8');
        unlinkSync('./src/test/assets/result.xml');
        expect(exampleToCompare).toMatch(compressedContent);
    });
    test('Testing Compress File Sync Without Sort Order', () => {
        let xmlContent = readFileSync('./src/test/assets/fileUncompressed.xml', 'utf8');
        writeFileSync('./src/test/assets/result.xml', xmlContent);
        const compressor = new XMLCompressor('./src/test/assets/result.xml');
        compressor.sortSimpleFirst();
        compressor.compressSync();
        let compressedContent = readFileSync('./src/test/assets/result.xml', 'utf8');
        let exampleToCompare = readFileSync('./src/test/assets/fileCompressed.xml', 'utf8');
        unlinkSync('./src/test/assets/result.xml');
    });
    test('Testing Compress File Sync File Not Exists', () => {
        let xmlContent = readFileSync('./src/test/assets/fileUncompressed.xml', 'utf8');
        writeFileSync('./src/test/assets/result.xml', xmlContent);
        try {
            const compressor = new XMLCompressor('./src/test/assets/result1.xml');
            compressor.sortSimpleFirst();
            compressor.compressSync();
        } catch (error) {
            expect(error.message).toContain('does not exists or not have access to it');
        }
        unlinkSync('./src/test/assets/result.xml');
    });
    test('Testing Compress Folder Sync', () => {
        try {
            const compressor = new XMLCompressor('./src/test/assets/folderToCompress');
            compressor.sortSimpleFirst();
            compressor.compressSync();
        } catch (error) {
            expect(error.message).toContain('Can\'t compress directory on sync mode. Execute compress() method to compress entire directory');
        }
    });
    test('Testing Compress File Async', async () => {
        let xmlContent = readFileSync('./src/test/assets/fileUncompressed.xml', 'utf8');
        writeFileSync('./src/test/assets/result.xml', xmlContent);
        const compressor = new XMLCompressor('./src/test/assets/result.xml');
        compressor.sortComplexFirst();
        await compressor.compress();
        unlinkSync('./src/test/assets/result.xml');
        return;
    });
    test('Testing Compress File Async File Not Exists', async () => {
        try {
            const compressor = new XMLCompressor('./src/test/assets/result1.xml');
            compressor.sortSimpleFirst();
            await compressor.compress();
        } catch (error) {
            expect(error.message).toContain('does not exists or not have access to it');
        }
        return;
    });
    test('Testing Compress Folder Sync', () => {
        try {
            const compressor = new XMLCompressor('./src/test/assets/folderToCompress');
            compressor.sortSimpleFirst();
            compressor.compressSync();
        } catch (error) {
            expect(error.message).toMatch('Can\'t compress directory on sync mode. Execute compress() method to compress entire directory');
        }
    });
    test('Testing Compress Folder Async', async () => {
        try {
            const compressor = new XMLCompressor('./src/test/assets/folderToCompress');
            compressor.sortSimpleFirst();
            await compressor.compress();
        } catch (error) {
            expect(error.message).toContain('File not found.');
        }
        return;
    });
    test('Testing Compress Folder Async With No Comprimible File', async () => {
        const compressor = new XMLCompressor('./src/test/assets/folderNotCompatible');
        compressor.sortSimpleFirst();
        await compressor.compress();
        return;
    });
});