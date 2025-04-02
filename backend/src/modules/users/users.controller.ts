import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { User } from './entity/user.entity';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolUsuario } from './entity/user.entity';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles(RolUsuario.ADMIN)
    @Post()
    async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
        return await this.usersService.createUser(createUserDto);
    }

    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles(RolUsuario.ADMIN)
    @Get(':id')
    async getUserById(@Param('id', ParseIntPipe) id: number): Promise<User> {
        return await this.usersService.getUserById(id);
    }

    @UseGuards(FirebaseAuthGuard)
    @Get('me')
    async getMyProfile(@Req() req): Promise<User> {
        return req.userDB;
    }


    @UseGuards(FirebaseAuthGuard)
    @Put(':id')
    async updateUser(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<User> {
        return await this.usersService.updateUser(id, updateUserDto);
    }

    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles(RolUsuario.ADMIN)
    @Delete(':id')
    async deleteUser(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return await this.usersService.deleteUser(id);
    }

    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles(RolUsuario.ADMIN)
    @Get()
    async findAll(): Promise<User[]> {
        return this.usersService.findAll();
    }

    @Post('check-email')
    async checkIfUserExists(@Body('email') email: string): Promise<{ exists: boolean }> {
        try {
            await this.usersService.getUserByEmail(email);
            return { exists: true };
        } catch (err) {
            return { exists: false };
        }
    }
}
