import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { User } from './entity/user.entity';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
        return await this.usersService.createUser(createUserDto);
    }

    @Get(':id')
    async getUserById(@Param('id') id: number): Promise<User> {
        return await this.usersService.getUserById(id);
    }

    @UseGuards(FirebaseAuthGuard)
    @Get('me')
    async getMyProfile(@Req() req) {
        const firebaseUid = req.user.uid;
        return this.usersService.getUserByFirebaseUid(firebaseUid);
    }


    @Put(':id')
    async updateUser(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto): Promise<User> {
        return await this.usersService.updateUser(id, updateUserDto);
    }

    @Delete(':id')
    async deleteUser(@Param('id') id: number): Promise<void> {
        return await this.usersService.deleteUser(id);
    }
}

