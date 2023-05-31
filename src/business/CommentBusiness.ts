import { CommentDatabase } from "../database/commentDataBase";
import { PostDatabase } from "../database/PostDatabase";
import { UserDatabase } from "../database/UserDatabase";
import { CreateCommentsInputDTO, GetCommentInputDTO, GetCommentOutputDTO, LikeOrDislikeCommentInputDTO } from "../dtos/commentDTO";
import { BadRequestError } from "../errors/BadRequestError";
import { NotFoundError } from "../errors/NotFoundError";
import { Comment } from "../models/comment";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";
import { CommentsDB, COMMENT_LIKE, LikesDislikesCommentsDB, TokenPayload } from "../types";

export class CommentBusiness {
    constructor(
        private postDatabase: PostDatabase,
        private commentDatabase: CommentDatabase,
        private userDatabase: UserDatabase,
        private idGenerator: IdGenerator,
        private tokenManager: TokenManager
    ) { }

    public getComments = async (
        input: GetCommentInputDTO
    ): Promise<GetCommentOutputDTO> => {
        const { token, post_id } = input

        if (token === undefined) {
            throw new BadRequestError("token ausente")
        }

        const payload = this.tokenManager.getPayload(token)

        if (payload === null) {
            throw new BadRequestError("token inválido")
        }

        const commentsDB: CommentsDB[] = await this.commentDatabase.getAllComments(post_id)

        const users = await this.userDatabase.getAllUsers()

        const comments = commentsDB.map((comment) => {
            const findUsers = users.find((user) => user.id === comment.creator_id)

            if (!findUsers) {
                throw new NotFoundError("Usuário não encontrado")
            }

            const creator: TokenPayload = {
                id: findUsers.id,
                name: findUsers.name,
                role: findUsers.role
            }

            const commentCreator = new Comment(
                comment.id,
                comment.content,
                comment.likes,
                comment.dislikes,
                comment.created_at,
                comment.updated_at,
                comment.post_id,
                creator
            )
            return commentCreator.toBusinessModel()
        })

        const output: GetCommentOutputDTO = comments
        return output
    }

    public getCommentsByPostId = async (input: GetCommentInputDTO): Promise<{}[]> => {

        const { post_id, token } = input

        if (token === undefined) {
            throw new BadRequestError("ERRO: É preciso enviar um token.")
        }
        const tokenValid = this.tokenManager.getPayload(token)

        if (tokenValid === null) {
            throw new BadRequestError("ERRO: O token é inválido.")
        }

        const commentsByPostIdDB = await this.commentDatabase.getCommentsByPostId(post_id)
        let userWithComments : {}[] = []

        for (const comment of commentsByPostIdDB) {
            const userDB = await this.commentDatabase.getUserById(comment.creator_id)
            const styleGetComment = {
                id: comment.id,
                creatorNickName: userDB.name,
                comment: comment.content,
                likes: comment.likes,
                dislikes: comment.dislikes,

            }
            userWithComments.push(styleGetComment)
        }
        return userWithComments
    }

    public createComment = async (
        input: CreateCommentsInputDTO
    ): Promise<void> => {
        const { token, post_id, content } = input

        if (!token) {
            throw new BadRequestError("ERRO: O token precisa ser informado.")
        }
        
        if (typeof post_id !== "string") {
            throw new BadRequestError("'post_id' não é uma string")
        }

        if (typeof content !== "string") {
            throw new BadRequestError("'content' não é uma string")
        }

        if (token === undefined) {
            throw new BadRequestError("ERRO: O token precisa ser informado.")
        }

        const payload = this.tokenManager.getPayload(token)

        if (payload === null) {
            throw new BadRequestError("token inválido")
        }

        const findPostById = await this.postDatabase.findById(post_id)

        if (!findPostById) {
            throw new BadRequestError("'Post' não encontrado")
        }

        const id = this.idGenerator.generate()
        const createdAt = new Date().toISOString()
        const updatedAt = new Date().toISOString()

        const comment = new Comment(
            id,
            content,
            0,
            0,
            createdAt,
            updatedAt,
            post_id,
            payload
        )

        const commentDB = comment.toDBModel()
        await this.commentDatabase.insert(commentDB)
        await this.commentDatabase.updateCommentsNumber(id, 1)
    }

    public likeOrDislikeComment = async (
        input: LikeOrDislikeCommentInputDTO
    ): Promise<void> => {
        const { idComment, token, like } = input

        if (token === undefined) {
            throw new BadRequestError("token ausente")
        }

        const payload = this.tokenManager.getPayload(token)

        if (payload === null) {
            throw new BadRequestError("token inválido")
        }

        if (typeof like !== "boolean") {
            throw new BadRequestError("'like' deve ser boolean")
        }

        const commentWithCreatorDB = await this.commentDatabase
            .findCommentWithCreatorById(idComment)

        if (!commentWithCreatorDB) {
            throw new NotFoundError("'id' não encontrado")
        }

        const userId = payload.id
        const likeSQLite = like ? 1 : 0

        const likeDislikeDB: LikesDislikesCommentsDB = {
            user_id: userId,
            comments_id: commentWithCreatorDB.id,
            like: likeSQLite
        }

        const creatorName: TokenPayload = {
            id: payload.id,
            name: payload.name,
            role: payload.role
        }

        const comment = new Comment(
            commentWithCreatorDB.id,
            commentWithCreatorDB.content,
            commentWithCreatorDB.likes,
            commentWithCreatorDB.dislikes,
            commentWithCreatorDB.created_at,
            commentWithCreatorDB.updated_at,
            commentWithCreatorDB.post_id,
            creatorName
        )

        const likeDislikeExists = await this.commentDatabase
            .findCommentLikeDislike(likeDislikeDB)

        if (likeDislikeExists === COMMENT_LIKE.ALREADY_LIKED) {
            if (like) {
                await this.commentDatabase.removeLikeDislike(likeDislikeDB)
                comment.removeLike()
            } else {
                await this.commentDatabase.updateLikeDislike(likeDislikeDB)
                comment.removeLike()
                comment.addDislike()
            }

        } else if (likeDislikeExists === COMMENT_LIKE.ALREADY_DISLIKED) {
            if (like) {
                await this.commentDatabase.updateLikeDislike(likeDislikeDB)
                comment.removeDislike()
                comment.addLike()
            } else {
                await this.commentDatabase.removeLikeDislike(likeDislikeDB)
                comment.removeDislike()
            }

        } else {
            await this.commentDatabase.likeOrDislikeComment(likeDislikeDB)

            like ? comment.addLike() : comment.addDislike()
        }

        const updatedCommentDB = comment.toDBModel()

        await this.commentDatabase.update(idComment, updatedCommentDB)
    }
}