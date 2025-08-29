import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

@Module({
  imports: [ProductsModule, AuthModule, OrdersModule],
  controllers: [AppController],
  providers: [
    AppService,
    // Global guards - order matters!
    // JwtAuthGuard runs first to validate JWT and attach user to request
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // RolesGuard runs second to check roles (only for authenticated users)
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
