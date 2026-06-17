import { Controller, Get, Post, Body, Patch, Param, Delete, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

@Controller('prisma')
export class PrismaService extends PrismaClient implements OnModuleInit,OnModuleDestroy {
 
 private logger = new Logger("Database")
  constructor() {
    
    const pool = new Pool({
      connectionString:process.env.DATABASE_URL,
    })
    const adapter = new PrismaPg(pool)

    super({adapter})
  }


  async onModuleInit() {
    try {
      this.$connect()

      this.logger.log('✅ Database connected successfully');

    } catch (error) {
      this.logger.error('❌ Error disconnecting from the database', error);
      process.exit(1)
    }
  }

  async onModuleDestroy() {
    try {

      this.$disconnect()

      this.logger.log('❌ Database disconnected successfully');
      
    } catch (error) {
       this.logger.error('❌ Error disconnecting from the database', error);
       process.exit(1)
      
    }
  }



}
