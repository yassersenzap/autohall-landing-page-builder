import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private get seedAdminEmail(): string {
    return process.env.SEED_ADMIN_EMAIL?.trim() ?? 'admin@autohall.local';
  }

  private isProtectedAccount(email: string): boolean {
    return email === this.seedAdminEmail;
  }

  async findAll() {
    const seedEmail = this.seedAdminEmail;
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return users.map((u) => ({ ...u, isProtected: u.email === seedEmail }));
  }

  async findOne(id: string) {
    const seedEmail = this.seedAdminEmail;
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException({
        success: false,
        message: 'Utilisateur introuvable',
        code: 'USER_NOT_FOUND',
      });
    }

    return { ...user, isProtected: user.email === seedEmail };
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new ConflictException({
        success: false,
        message: 'Cette adresse e-mail est déjà utilisée',
        code: 'USER_EMAIL_CONFLICT',
      });
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const seedEmail = this.seedAdminEmail;

    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email.toLowerCase().trim(),
        passwordHash,
        role: dto.role ?? UserRole.SI_DESIGNER,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return { ...user, isProtected: user.email === seedEmail };
  }

  async updateRole(id: string, role: UserRole, requesterId: string) {
    const target = await this.findOne(id);

    if (id === requesterId) {
      throw new BadRequestException({
        success: false,
        message: 'Vous ne pouvez pas modifier votre propre rôle',
        code: 'USER_SELF_ROLE_CHANGE',
      });
    }

    if (this.isProtectedAccount(target.email)) {
      throw new BadRequestException({
        success: false,
        message: 'Le compte administrateur principal ne peut pas être modifié',
        code: 'USER_SEED_PROTECTED',
      });
    }

    const seedEmail = this.seedAdminEmail;
    const user = await this.prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    return { ...user, isProtected: user.email === seedEmail };
  }

  async toggleActive(id: string, requesterId: string) {
    if (id === requesterId) {
      throw new BadRequestException({
        success: false,
        message: 'Vous ne pouvez pas désactiver votre propre compte',
        code: 'USER_SELF_DEACTIVATE',
      });
    }

    const target = await this.findOne(id);

    if (this.isProtectedAccount(target.email)) {
      throw new BadRequestException({
        success: false,
        message: 'Le compte administrateur principal ne peut pas être désactivé',
        code: 'USER_SEED_PROTECTED',
      });
    }

    const seedEmail = this.seedAdminEmail;
    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive: !target.isActive },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    return { ...user, isProtected: user.email === seedEmail };
  }

  async resetPassword(id: string, newPassword: string) {
    await this.findOne(id);
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const seedEmail = this.seedAdminEmail;

    const user = await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    return { ...user, isProtected: user.email === seedEmail };
  }

  async remove(id: string, requesterId: string) {
    if (id === requesterId) {
      throw new BadRequestException({
        success: false,
        message: 'Vous ne pouvez pas supprimer votre propre compte',
        code: 'USER_SELF_DELETE',
      });
    }

    const target = await this.findOne(id);

    if (this.isProtectedAccount(target.email)) {
      throw new BadRequestException({
        success: false,
        message: 'Le compte administrateur principal ne peut pas être supprimé',
        code: 'USER_SEED_PROTECTED',
      });
    }

    await this.prisma.user.delete({ where: { id } });
  }
}
