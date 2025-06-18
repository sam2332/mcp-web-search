import { spawn } from 'child_process';

// Test the MCP server
const server = spawn('node', ['build/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// Send initialization request
const initRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'test-client', version: '1.0.0' }
  }
};

// Send list tools request
const listToolsRequest = {
  jsonrpc: '2.0',
  id: 2,
  method: 'tools/list',
  params: {}
};

// Send search request
const searchRequest = {
  jsonrpc: '2.0',
  id: 3,
  method: 'tools/call',
  params: {
    name: 'search',
    arguments: {
      query: 'javascript tutorial',
      limit: 3
    }
  }
};

let responseCount = 0;

server.stdout.on('data', (data) => {
  const responses = data.toString().trim().split('\n');
  responses.forEach(response => {
    if (response.trim()) {
      try {
        const parsed = JSON.parse(response);
        console.log(`Response ${++responseCount}:`, JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log('Raw response:', response);
      }
    }
  });
});

server.stderr.on('data', (data) => {
  console.error('Error:', data.toString());
});

// Send requests
setTimeout(() => {
  server.stdin.write(JSON.stringify(initRequest) + '\n');
}, 100);

setTimeout(() => {
  server.stdin.write(JSON.stringify(listToolsRequest) + '\n');
}, 200);

setTimeout(() => {
  server.stdin.write(JSON.stringify(searchRequest) + '\n');
}, 300);

setTimeout(() => {
  server.kill();
}, 5000);
