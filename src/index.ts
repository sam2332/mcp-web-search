#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import path from 'path';

interface SearchResult {
  title: string;
  url: string;
  description: string;
}

const isValidSearchArgs = (args: any): args is { query: string; limit?: number } =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.query === 'string' &&
  (args.limit === undefined || typeof args.limit === 'number');

class WebSearchServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'web-search',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'search',
          description: 'Search the web using DuckDuckGo (no API key required)',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query',
              },
              limit: {
                type: 'number',
                description: 'Maximum number of results to return (default: 5)',
                minimum: 1,
                maximum: 10,
              },
            },
            required: ['query'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name !== 'search') {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
        );
      }

      if (!isValidSearchArgs(request.params.arguments)) {
        throw new McpError(
          ErrorCode.InvalidParams,
          'Invalid search arguments'
        );
      }

      const query = request.params.arguments.query;
      const limit = Math.min(request.params.arguments.limit || 5, 10);

      try {
        const results = await this.performSearch(query, limit);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      } catch (error) {
        if (error instanceof McpError) {
          return {
            content: [
              {
                type: 'text',
                text: `Search error: ${error.message}`,
              },
            ],
            isError: true,
          };
        }
        throw error;
      }
    });
  }

  private async performSearch(query: string, limit: number): Promise<SearchResult[]> {
    // Use Selenium for real browser automation
    // This will launch Chrome and perform a real search
    const seleniumPath = path.resolve(__dirname, 'selenium-search.js');
    const { duckDuckGoSearch } = require(seleniumPath);
    try {
      const results = await duckDuckGoSearch(query, limit);
      return results;
    } catch (error) {
      console.error('Selenium search error:', error);
      return [{
        title: 'Search error',
        url: '',
        description: error instanceof Error ? error.message : 'Unknown error',
      }];
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Web Search MCP server running on stdio');
  }
}

const server = new WebSearchServer();
server.run().catch(console.error);
