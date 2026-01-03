const db = require('../db/db');
const fs = require('fs');
const path = require('path');

async function testStorage() {
    console.log('Testing PDF Storage Logic...');

    const testFilename = `test-${Date.now()}.pdf`;
    const testMimetype = 'application/pdf';
    const testData = Buffer.from('Dummy PDF Content');

    try {
        // 1. Test insertion
        console.log(`Inserting test file: ${testFilename}`);
        await db('file_store').insert({
            filename: testFilename,
            mimetype: testMimetype,
            data: testData
        });
        console.log('✅ File inserted successfully');

        // 2. Test retrieval
        console.log(`Retrieving test file: ${testFilename}`);
        const retrieved = await db('file_store').where({ filename: testFilename }).first();

        if (retrieved && retrieved.data.toString() === testData.toString()) {
            console.log('✅ File retrieved and content matches');
        } else {
            console.error('❌ File retrieval failed or content mismatch');
        }

        // 3. Cleanup
        await db('file_store').where({ filename: testFilename }).del();
        console.log('✅ Cleanup successful');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        process.exit();
    }
}

testStorage();
