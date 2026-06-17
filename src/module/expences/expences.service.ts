import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expence.dto'; 
import { UpdateExpenceDto } from './dto/update-expence.dto';
import { PrismaService } from 'src/core/prisma/prisma.controller'; // Loyihangizdagi import yo'li

@Injectable()
export class ExpencesService {
  constructor(private readonly prismaService: PrismaService) {}

  // 1. Yangi xarajat kiritish
  async create(id:string,createExpenseDto: CreateExpenseDto) {
    const { name, amount, description,  date } = createExpenseDto;
    
    return await this.prismaService.expense.create({
      data: {
        title:name,
        amount,
        kategoriya: createExpenseDto.kategoriya,
        description: description ? `${description} (Kategoriya: ${createExpenseDto.kategoriya})` : `Kategoriya: ${createExpenseDto.kategoriya}`,
        createdById:id,
        createdAt: date ? new Date(date) : new Date(),
      },
    });
  }

  // 2. Barcha xarajatlarni olish
  async findAll() {
    return await this.prismaService.expense.findMany({
      orderBy: {
        createdAt: 'desc', // Yangi kiritilgan xarajatlar birinchi ko'rinadi
      },
    });
  }

  async findOne(id: string) {
    const expense = await this.prismaService.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      throw new NotFoundException(`ID-si ${id} bo'lgan xarajat topilmadi.`);
    }

    return expense;
  }

  // 4. Xarajat ma'lumotlarini ID bo'yicha yangilash
  async update(id: string,userId:string, updateExpenseDto: UpdateExpenceDto) {
    // Avval xarajat borligini tekshiramiz
    let old =await this.findOne(id);

    const { name, amount, description,  date,kategoriya } = updateExpenseDto;

    

    return await this.prismaService.expense.update({
      where: { id },
      data: {
        title:name,
        amount,
        description,
        kategoriya: kategoriya ?? old.kategoriya ,
        createdById:userId,
        createdAt: date ? new Date(date) : undefined,
      },
    });
  }

  // 5. Xarajatni tizimdan o'chirish
  async remove(id: string) {
    // Avval xarajat borligini tekshiramiz
    await this.findOne(id);

    await this.prismaService.expense.delete({
      where: { id },
    });

    return { success: true, message: `Xarajat muvaffaqiyatli o'chirildi.` };
  }


  async ProfileMe(id:string){
    
    let data = await this.prismaService.user.findFirst({
      where:{
        id
      }
    })

    if(!data){
      throw new NotFoundException("User topilmadi.")
    }


    return { success:true,message:"User profile olindi.",data}
  }
}