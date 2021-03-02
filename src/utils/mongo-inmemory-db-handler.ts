import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { DynamicModule } from '@nestjs/common';

let mongod: MongoMemoryServer;

export function rootMongooseTestModule(
  options: MongooseModuleOptions = {},
): DynamicModule {
  return MongooseModule.forRootAsync({
    useFactory: async () => {
      mongod = new MongoMemoryServer();
      const mongoUri = await mongod.getUri();
      return {
        uri: mongoUri,
        ...options,
      };
    },
  });
}

export async function closeInMemoryMongoConnection(): Promise<void> {
  if (mongod) await mongod.stop();
}
