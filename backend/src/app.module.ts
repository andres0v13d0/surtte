import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import * as fs from 'fs';
import { UsersModule } from './modules/users/users.module';

async function getDatabaseSecrets() {
  const client = new SecretsManagerClient({ region: 'us-east-2' });
  
  try{
    const response = await client.send(
      new GetSecretValueCommand({ 
        SecretId: 'CredencialesBD',
        VersionStage: 'AWSCURRENT',
      })
    );

    return JSON.parse(response.SecretString || '{}');
  } catch (error) {
    console.error('Error getting database secrets:', error);
    throw new Error('Error getting database secrets');
  }

}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const dbConfig = await getDatabaseSecrets();

        return {
          type: dbConfig.engine,
          host: dbConfig.host,
          port: Number(dbConfig.port),
          username: dbConfig.username,
          password: dbConfig.password?.replace(/\\n/g, '\n'),
          database: dbConfig.database,
          autoLoadEntities: true,
          synchronize: true,
          ssl: {
            ca: fs.readFileSync('/app/rds-ca.pem').toString(),
          }
        };
      },
    }),
    UsersModule,
  ],
})
export class AppModule {}
