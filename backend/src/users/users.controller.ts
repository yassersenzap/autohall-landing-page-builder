import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { Permission } from '../auth/permissions.config';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermission(Permission.MANAGE_USERS)
  async findAll() {
    const data = await this.usersService.findAll();
    return { success: true, data, message: 'Users retrieved' };
  }

  @Get(':id')
  @RequirePermission(Permission.MANAGE_USERS)
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.usersService.findOne(id);
    return { success: true, data, message: 'User retrieved' };
  }

  @Post()
  @RequirePermission(Permission.MANAGE_USERS)
  async create(@Body() dto: CreateUserDto) {
    const data = await this.usersService.create(dto);
    return { success: true, data, message: 'Utilisateur créé' };
  }

  @Patch(':id/role')
  @RequirePermission(Permission.MANAGE_ROLES)
  async updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser() requester: AuthenticatedUser,
  ) {
    const data = await this.usersService.updateRole(id, dto.role, requester.id);
    return { success: true, data, message: 'Rôle mis à jour' };
  }

  @Patch(':id/toggle-active')
  @RequirePermission(Permission.MANAGE_USERS)
  @HttpCode(HttpStatus.OK)
  async toggleActive(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() requester: AuthenticatedUser,
  ) {
    const data = await this.usersService.toggleActive(id, requester.id);
    return { success: true, data, message: 'Statut utilisateur mis à jour' };
  }

  @Patch(':id/reset-password')
  @RequirePermission(Permission.MANAGE_USERS)
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ResetPasswordDto,
  ) {
    const data = await this.usersService.resetPassword(id, dto.password);
    return { success: true, data, message: 'Mot de passe réinitialisé' };
  }

  @Delete(':id')
  @RequirePermission(Permission.MANAGE_USERS)
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() requester: AuthenticatedUser,
  ) {
    await this.usersService.remove(id, requester.id);
    return { success: true, data: null, message: 'Utilisateur supprimé' };
  }
}
