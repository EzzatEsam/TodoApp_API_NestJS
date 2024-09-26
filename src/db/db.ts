import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from 'src/db/schema';
@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private client: Client;
  private db: NodePgDatabase<typeof schema> | null = null;

  constructor(private configService: ConfigService) {
    this.client = new Client({
      connectionString: this.configService.get<string>('NEON_DB_URL'),
      // host: this.configService.get<string>('DB_HOST'),
      // port: this.configService.get<number>('DB_PORT'),
      // user: this.configService.get<string>('DB_USER'),
      // password: this.configService.get<string>('DB_PASS'),
      // database: this.configService.get<string>('DB_NAME'),
      // ssl: this.configService.get<boolean>('DB_SSL', false),
    });
  }

  // Initializes the connection asynchronously
  async onModuleInit(): Promise<void> {
    try {
      await this.client.connect();
      console.log('Database connection established.');
    } catch (error) {
      console.error('Error connecting to the database', error);
      throw new Error('Could not connect to the database');
    }
  }

  // Get or lazily instantiate the `drizzle` object
  getDb() {
    if (!this.db) {
      this.db = drizzle(this.client, { schema });
    }
    return this.db;
  }

  // Clean up resources when the module is destroyed
  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.end();
      console.log('Database connection closed.');
    }
  }
}
