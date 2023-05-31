import { Request, Response } from "express";
import { PostBusiness } from "../business/PostsBusiness";
import {
  CreatePostSchema,
  CreatePostsInputDTO,
  DeletePostInputDTO,
  EditPostInputDTO,
  GetPostInputDTO,
  GetPostsSchema,
  LikeOrDislikePostInputDTO,
} from "../dtos/userDTO";
import { BaseError } from "../errors/BaseError";
import { ZodError } from "zod";


export class PostController {
  constructor(private postBusiness: PostBusiness) {}

  public getPosts = async (req: Request, res: Response) => {
    try {
      const input = GetPostsSchema.parse({
          token: req.headers.authorization
      })

      const output = await this.postBusiness.getPosts(input);

      res.status(200).send(output);
    } catch (error) {
      console.log(error);

      if(error instanceof ZodError) {
                res.status(400).send(error.issues)
             } else if (error instanceof BaseError) {
                res.status(error.statusCode).send(error.message)
             } else {
                res.status(500).send("Erro Inesperado")
            }  
    }
  };

  public createPost = async (req: Request, res: Response) => {
    try {

      const input = CreatePostSchema.parse({
          content: req.body.content,
          token: req.headers.authorization
      })

      const output = await this.postBusiness.createPost(input)

      res.status(201).send(output)
    } catch (error) {
      console.log(error);
      if (error instanceof BaseError) {
        res.status(error.statusCode).send(error.message);
      } else {
        res.status(500).send("Erro inesperado");
      }
    }
  };

  public editPost = async (req: Request, res: Response) => {
    try {
      const input: EditPostInputDTO = {
        idToEdit: req.params.id,
        content: req.body.content,
        token: req.headers.authorization,
      };

      await this.postBusiness.editPost(input);

      res.status(200).end();
    } catch (error) {
      console.log(error);
      if (error instanceof BaseError) {
        res.status(error.statusCode).send(error.message);
      } else {
        res.status(500).send("Erro inesperado");
      }
    }
  };

  public deletePost = async (req: Request, res: Response) => {
    try {
      const input: DeletePostInputDTO = {
        idToDelete: req.params.id,
        token: req.headers.authorization,
      };

      await this.postBusiness.deletePost(input);

      res.status(200).end();
    } catch (error) {
      console.log(error);
      if (error instanceof BaseError) {
        res.status(error.statusCode).send(error.message);
      } else {
        res.status(500).send("Erro inesperado");
      }
    }
  };

  public likeOrDislikePost = async (req: Request, res: Response) => {
    try {
      const input: LikeOrDislikePostInputDTO = {
        idToLikeOrDislike: req.params.id,
        token: req.headers.authorization,
        like: req.body.like,
      };

      await this.postBusiness.likeOrDislikePost(input);

      res.status(200).end();
    } catch (error) {
      console.log(error);
      if (error instanceof BaseError) {
        res.status(error.statusCode).send(error.message);
      } else {
        res.status(500).send("Erro inesperado");
      }
    }
  };
}
