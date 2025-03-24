import axios from 'axios';
import { startServer } from './server';

const API_URL = 'http://localhost:3000'; // Adjust port if needed
let server: any;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function runTests() {
    console.log('🚀 Starting API tests...\n');

    try {
        // Start server and wait for it to be ready
        server = await startServer();
        await delay(1000); // Wait 1 second for server to fully initialize

        // Test 1: Basic API Connection
        console.log('Test 1: Basic API Connection');
        const connectionResponse = await axios.get(`${API_URL}/health`);
        console.log('API Connection Test:', connectionResponse.data);
        console.log('✅ API Connected:', connectionResponse.data, '\n');

        // Test 2: Create User
        console.log('Test 2: Create User');
        const createResponse = await axios.post(`${API_URL}/users`, {
            id: 'test-123',
            name: 'Test User'
        });
        console.log('✅ User Created:', createResponse.data, '\n');

        // Test 3: Get User
        console.log('Test 3: Get User');
        const getResponse = await axios.get(`${API_URL}/users/test-123`);
        console.log('✅ User Retrieved:', getResponse.data, '\n');

        // Test 4: Non-existent User
        console.log('Test 4: Non-existent User');
        try {
            await axios.get(`${API_URL}/users/nonexistent`);
        } catch (error: any) {
            if (error.response?.status === 404) {
                console.log('✅ 404 Error handled correctly\n');
            }
        }

        // Test 5: Update User
        console.log('Test 5: Update User');
        const updateResponse = await axios.put(`${API_URL}/users/test-123`, {
            name: 'Updated User'
        });
        console.log('✅ User Updated:', updateResponse.data, '\n');

        // Test 6: Delete User
        console.log('Test 6: Delete User');
        await axios.delete(`${API_URL}/users/test-123`);
        console.log('✅ User Deleted\n');

        // Verify deletion
        try {
            await axios.get(`${API_URL}/users/test-123`);
        } catch (error: any) {
            if (error.response?.status === 404) {
                console.log('✅ Delete verification successful\n');
            }
        }

        // Test 7: Get All Users
        console.log('Test 7: Get All Users');
        const getAllResponse = await axios.get(`${API_URL}/users`);
        console.log('✅ All Users Retrieved:', getAllResponse.data, '\n');

        // Test 8: Filter Users
        console.log('Test 8: Filter Users');
        const filterResponse = await axios.get(`${API_URL}/users?name=Updated`);
        console.log('✅ Filtered Users:', filterResponse.data, '\n');

        // Test 9: Validation
        console.log('Test 9: Validation');
        try {
            await axios.post(`${API_URL}/users`, { name: 'Invalid User' });
        } catch (error: any) {
            if (error.response?.status === 400) {
                console.log('✅ Validation working correctly\n');
            }
        }

        // Test 10: Rate Limiting
        console.log('Test 10: Rate Limiting');
        try {
            // Make multiple requests quickly
            const promises = Array(5).fill(null).map(() => 
                axios.get(`${API_URL}/health`)
            );
            await Promise.all(promises);
            console.log('✅ Rate limit not exceeded for normal usage\n');
        } catch (error: any) {
            console.error('❌ Rate limit test failed:', error.message);
        }

        // Test 11: Caching
        console.log('Test 11: Caching');
        
        // Make several requests and average the times
        const numRequests = 3;
        let totalUncached = 0;
        let totalCached = 0;

        // First set of requests - uncached
        for (let i = 0; i < numRequests; i++) {
            const start = Date.now();
            await axios.get(`${API_URL}/health`);
            totalUncached += Date.now() - start;
        }
        const avgUncached = totalUncached / numRequests;

        // Second set of requests - should be cached
        for (let i = 0; i < numRequests; i++) {
            const start = Date.now();
            await axios.get(`${API_URL}/health`);
            totalCached += Date.now() - start;
        }
        const avgCached = totalCached / numRequests;

        console.log(`Average uncached request: ${avgUncached.toFixed(2)}ms`);
        console.log(`Average cached request: ${avgCached.toFixed(2)}ms`);

        if (avgCached < avgUncached) {
            console.log('✅ Cache working: Cached requests faster than uncached\n');
        } else {
            throw new Error('Cache test failed: Cached requests were not faster');
        }

        // Test 12: Request Recording
        console.log('\nTest 12: Request Recording');
        const recordings = await axios.get(`${API_URL}/recordings`);
        if (recordings.data.length > 0) {
            console.log(`✅ Requests recorded: ${recordings.data.length} entries\n`);
        } else {
            throw new Error('Recording test failed: No requests recorded');
        }

        // Clear recordings
        await axios.delete(`${API_URL}/recordings`);
        console.log('✅ Recordings cleared\n');

        // Test 13: ML Server Integration
        console.log('\nTest 13: ML Server Integration');
        try {
            const mlResponse = await axios.post(`${API_URL}/ml/analyze`, {
                text: "Hello from Copy-Cat!"
            });
            console.log('✅ ML Analysis:', mlResponse.data, '\n');
        } catch (error: any) {
            console.log('⚠️ ML server not running, skipping test\n');
        }

        console.log('🎉 All tests completed successfully!');
    } catch (error: any) {
        console.error('❌ Test failed:', error.message || error);
        process.exit(1);
    } finally {
        // Cleanup: Stop server
        if (server) {
            await new Promise(resolve => server.close(resolve));
            console.log('\n🛑 Server stopped');
        }
    }
}

runTests();
