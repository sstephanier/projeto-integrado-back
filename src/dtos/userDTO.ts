import { PostModel } from "../types";
import z from 'zod'

export interface SignupInputDTO {
  name: string;
  email: string;
  password: string;
}

export interface SignupOutputDTO {
  token: string;
}

export const SignupSchema = z.object({
  name: z.string().min(2),
  email:  z.string().email(),
  password:  z.string().min(4)
}).transform(data => data as SignupInputDTO)


export interface LoginInputDTO {
  email: string;
  password: string;
}

export interface LoginOutputDTO {
  token: string;
}

export const LoginSchema = z.object ({
  email: z.string().email(),
  password:  z.string().min(4)
}).transform(data => data as LoginInputDTO)

export interface GetPostInputDTO {
  token: string ;
}

export type GetPostsOutputDTO = PostModel[];

export const GetPostsSchema = z.object ({
  token: z.string().min(1)
}).transform(data => data as GetPostInputDTO)

export interface CreatePostsInputDTO {
  token: string ;
  content: string;
}

export type CreatePostOutputDTO = undefined

export const CreatePostSchema = z.object ({
  content: z.string().min(1),
  token: z.string().min(1)
}).transform(data => data as CreatePostsInputDTO)

export interface EditPostInputDTO {
  idToEdit: string;
  token: string | undefined;
  content: string;
}

export interface DeletePostInputDTO {
  idToDelete: string;
  token: string | undefined;
}

export interface LikeOrDislikePostInputDTO {
  idToLikeOrDislike: string;
  token: string | undefined;
  like: unknown;
}


export interface GetPostByIdInputDTO {
  id: string
  token: string | undefined
}