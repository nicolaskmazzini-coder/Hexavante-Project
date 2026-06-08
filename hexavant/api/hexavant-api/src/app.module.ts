import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: '192.168.10.40', // O IP do teu servidor Debian
      port: 3306,
      username: 'root',
      password: 'hexavante2026',
      database: 'hexavant_db', // O nome que deste ao banco
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Auto-cria as tabelas (ideal para o TCC)
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}