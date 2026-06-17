import { PartialType } from '@nestjs/swagger';
import { CreateExpenseDto } from './create-expence.dto';

export class UpdateExpenceDto extends PartialType(CreateExpenseDto) {}
