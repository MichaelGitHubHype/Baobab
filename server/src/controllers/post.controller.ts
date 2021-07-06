import { ApiResponse } from '@nestjs/swagger';
import {
  InternalServerErrorException,
  Body,
  Controller,
  Post,
  Res,
  Req,
  BadRequestException,
  Query,
  Get,
} from '@nestjs/common';
import { PostService } from '../services/post.service';
import { Response } from 'express';
import {
  PostRequest,
  PostPaginationRequest,
  RepliesPaginationRequest,
  UserRepliesPaginationRequest,
  UserPostsPaginationRequest,
  PostResponse,
} from 'baobab-common';
import { Post as PostEntity } from '../entities/post.entity';
import { JwtAuth } from './jwt.decorator';

@Controller('post')
export class PostController {
  constructor(private _postService: PostService) {}

  @JwtAuth()
  @Post('create')
  @ApiResponse({ status: 201, description: 'The post is created.' })
  @ApiResponse({ status: 400, description: 'Invalid request.' })
  createPost(
    @Body() reqBody: PostRequest,
    @Res({ passthrough: true }) res: Response,
    @Req() req,
  ) {
    const today = new Date();
    let parent: PostEntity;
    if (reqBody.parentID == -1) {
      parent = undefined;
    } else {
      parent = this._postService.getParentPost(reqBody.parentID);
      if (!parent) {
        throw new BadRequestException({
          errors: [],
        });
      }
    }
    const post = this._postService.createPost(
      req.user.id,
      reqBody.content,
      today,
      parent,
    );
    if (!post) {
      throw new InternalServerErrorException({
        errors: [],
      });
    }
  }

  @Get('pagination')
  async pagination(
    @Query() query: PostPaginationRequest,
  ): Promise<PostResponse[]> {
    const paginatedPosts = await this._postService.getPaginatedPosts(
      query.start,
      query.end,
    );
    return paginatedPosts;
  }

  @Get('replies')
  async replies(
    @Query() query: RepliesPaginationRequest,
  ): Promise<PostResponse[]> {
    const paginatedReplies = await this._postService.getReplies(
      query.id,
      query.start,
      query.end,
    );
    return paginatedReplies;
  }

  @Get('userreplies')
  async userReplies(
    @Query() query: UserRepliesPaginationRequest,
  ): Promise<PostResponse[]> {
    const paginatedReplies = await this._postService.getUserReplies(
      query.id,
      query.start,
      query.end,
    );
    return paginatedReplies;
  }

  @Get('userposts')
  async userPosts(
    @Query() query: UserPostsPaginationRequest,
  ): Promise<PostResponse[]> {
    const paginatedReplies = await this._postService.getUserPosts(
      query.id,
      query.start,
      query.end,
    );
    return paginatedReplies;
  }
}
