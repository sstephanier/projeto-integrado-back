import { Request, Response } from "express";
import { CommentBusiness } from "../business/CommentBusiness"
import { CreateCommentsInputDTO, GetCommentInputDTO, LikeOrDislikeCommentInputDTO } from "../dtos/commentDTO";
import { LikeOrDislikePostInputDTO } from "../dtos/userDTO";
import { BaseError } from "../errors/BaseError";
import { LikeDislikeComment } from "../models/likeDislikeComments";

export class CommentController {
    constructor(
        private commentBusiness: CommentBusiness
    ) { }

    public getComments = async (req: Request, res: Response) => {
        try {
            const input: GetCommentInputDTO = {
                token: req.headers.authorization,
                post_id: req.params.id
            }
            const output = await this.commentBusiness.getComments(input)

            res.status(200).send(output)

        } catch (error) {
            console.log(error)
            if (error instanceof BaseError) {
                res.status(error.statusCode).send(error.message)
            } else {
                res.status(500).send("Erro inesperado")
            }
        }
    }

    public getCommentsByPostId = async (req: Request, res: Response) => {

        try {
            const input: GetCommentInputDTO = {
                post_id: req.params.id,
                token: req.headers.authorization
            }
 
            const output = await this.commentBusiness.getCommentsByPostId(input)

            res.status(200).send(output)

        } catch (error) {
            console.log(error)

            if (error instanceof BaseError) {
                res.status(error.statusCode).send(error.message)
            } else {
                res.status(500).send("Erro inesperado.")
            }
        }
    }

    public createComments = async (req: Request, res: Response) => {
        try {
            const input: CreateCommentsInputDTO = {
                token: req.headers.authorization,
                content: req.body.content,
                post_id: req.params.id
            }

            const output = await this.commentBusiness.createComment(input)

            res.status(201).send(output)

        } catch (error) {
            console.log(error)
            if (error instanceof BaseError) {
                res.status(error.statusCode).send(error.message)
            } else {
                res.status(500).send("Erro inesperado")
            }
        }
    }

    public likeOrDislikeComments = async (req: Request, res: Response) => {
        try {
            const input: LikeOrDislikeCommentInputDTO = {
                idComment: req.params.id,
                token: req.headers.authorization,
                like: req.body.like
            }

           const output = await this.commentBusiness.likeOrDislikeComment(input)

            res.status(200).send(output)
        } catch (error) {
            console.log(error)
            if (error instanceof BaseError) {
                res.status(error.statusCode).send(error.message)
            } else {
                res.status(500).send("Erro inesperado")
            }
        }
    }
}