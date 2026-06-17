import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setTimeout(()=>{

    console.log(new Date().toLocaleTimeString());
    

    
  },1000)


  app.useGlobalPipes(new ValidationPipe({whitelist:true,transform:true}))
  app.enableCors()


  let config = new DocumentBuilder()
  .addBearerAuth()
  .setTitle("Farganiy Crm")
  .build()


  let document = SwaggerModule.createDocument(app,config)

  SwaggerModule.setup("swagger",app,document)

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Starting server...  http://localhost:${process.env.PORT ?? 3000}`)

  setTimeout(()=>{

    console.log(new Date().toLocaleTimeString());
    
  },10)


}
bootstrap();
 