import { PostDatabase } from '../database/PostDatabase'
import { LikeOrDislikeCommentInputDTO } from '../dtos/commentDTO';
import { CreatePostsInputDTO, DeletePostInputDTO, EditPostInputDTO, GetPostByIdInputDTO, GetPostInputDTO, GetPostsOutputDTO, LikeOrDislikePostInputDTO } from '../dtos/userDTO';
import { BadRequestError } from '../errors/BadRequestError';
import { NotFoundError } from '../errors/NotFoundError';
import { UnauthorizedError } from '../errors/UnauthorizedError';
import { Post } from '../models/Post';
import { IdGenerator } from '../services/IdGenerator';
import { TokenManager } from '../services/TokenManager';
import { PostWithCreatorDB, USER_ROLES, POST_LIKE, LikeDislikeDB} from '../types';

export class PostBusiness {
    constructor(
        private postDatabase: PostDatabase,
        private idGenerator: IdGenerator,
        private tokenManager: TokenManager
    ) { }

    public getPosts = async (
        input: GetPostInputDTO
    ): Promise<GetPostsOutputDTO> => {
        const { token } = input

        const payload = this.tokenManager.getPayload(token)

        if (payload === null) {
             throw new UnauthorizedError()
        }


        const postWithCreatorsDB: PostWithCreatorDB[] =
            await this.postDatabase
                .getPostsWithCreators()

        const posts = postWithCreatorsDB.map(
            (postWithCreatorDB) => {
                const post = new Post(
                    postWithCreatorDB.id,
                    postWithCreatorDB.content,
                    postWithCreatorDB.likes,
                    postWithCreatorDB.dislikes,
                    postWithCreatorDB.comments,
                    postWithCreatorDB.created_at,
                    postWithCreatorDB.updated_at,
                    postWithCreatorDB.creator_id,
                    postWithCreatorDB.creator_name
                )

                return post.toBusinessModel()
            }
        )
        const output: GetPostsOutputDTO = posts
        // GetPostOutputDTO
        return output
    }

    public getPostById = async (input: GetPostByIdInputDTO) => {
        const { id, token } = input

        if (!token) {
            throw new BadRequestError("ERRO: O token precisa ser informado.")
        }
        
        const tokenValid = this.tokenManager.getPayload(token)

        if (tokenValid === null) {
            throw new BadRequestError("ERRO: O token é inválido.")
        }
        const savePostsbyIdDB = await this.postDatabase.getPostById(id)

        if(!id) {
            throw new BadRequestError("ERRO: O id não existe.");
        }

        if (!savePostsbyIdDB) {
            throw new BadRequestError("ERRO: Post não encontrado.")
        }

        const instancePost = new Post(
            savePostsbyIdDB.id,
            savePostsbyIdDB.content,
            savePostsbyIdDB.likes,
            savePostsbyIdDB.dislikes,
            savePostsbyIdDB.comments,
            savePostsbyIdDB.created_at,
            savePostsbyIdDB.updated_at,
            savePostsbyIdDB.creator_id,
            savePostsbyIdDB.creator_name
        )
        const postBusiness = instancePost.toBusinessModel()

        const idCreator = instancePost.getCreatorId()

        const userDB = await this.postDatabase.getUserById(idCreator)

        const styleGetPost = {
            ...postBusiness,
            name: userDB.name
        }
        return styleGetPost
    }

    public createPost = async (
        input: CreatePostsInputDTO
    ): Promise<void> => {
        const { token, content } = input

        if (token === undefined) {
            throw new BadRequestError("token ausente")
        }

        const payload = this.tokenManager.getPayload(token)

        if (payload === null) {
            throw new BadRequestError("token inválido")
        }

        if (typeof content !== "string") {
            throw new BadRequestError("'content' deve ser string")
        }

        const id = this.idGenerator.generate()
        const createdAt = new Date().toISOString()
        const updatedAt = new Date().toISOString()
        const creatorId = payload.id
        const creatorName = payload.name

        const post = new Post(
            id,
            content,
            0,
            0,
            0,
            createdAt,
            updatedAt,
            creatorId,
            creatorName
        )

        const postDB = post.toDBModel()

        await this.postDatabase.insert(postDB)
    }

    public editPost = async (
        input: EditPostInputDTO
    ): Promise<void> => {
        const { idToEdit, token, content } = input

        if (token === undefined) {
            throw new BadRequestError("token ausente")
        }

        const payload = this.tokenManager.getPayload(token)

        if (payload === null) {
            throw new BadRequestError("token inválido")
        }

        if (typeof content !== "string") {
            throw new BadRequestError("'content' deve ser string")
        }

        const postDB = await this.postDatabase.findById(idToEdit)

        if (!postDB) {
            throw new NotFoundError("'id' não encontrado")
        }

        const creatorId = payload.id

        if (postDB.creator_id !== creatorId) {
            throw new BadRequestError("somente quem criou o post pode editar")
        }

        const creatorName = payload.name

        const post = new Post(
            postDB.id,
            postDB.content,
            postDB.likes,
            postDB.dislikes,
            postDB.comments,
            postDB.created_at,
            postDB.updated_at,
            creatorId,
            creatorName
        )

        post.setContent(content)
        post.setUpdatedAt(new Date().toISOString())

        const updatedPostDB = post.toDBModel()

        await this.postDatabase.update(idToEdit, updatedPostDB)
    }

    public deletePost = async (
        input: DeletePostInputDTO
    ): Promise<void> => {
        const { idToDelete, token } = input

        if (token === undefined) {
            throw new BadRequestError("token ausente")
        }

        const payload = this.tokenManager.getPayload(token)

        if (payload === null) {
            throw new BadRequestError("token inválido")
        }

        const postDB = await this.postDatabase.findById(idToDelete)

        if (!postDB) {
            throw new NotFoundError("'id' não encontrado")
        }

        const creatorId = payload.id

        if (
            payload.role !== USER_ROLES.ADMIN
            && postDB.creator_id !== creatorId
        ) {
            throw new BadRequestError("somente Admin ou quem criou o post pode deletá-lo")
        }

        await this.postDatabase.delete(idToDelete)
    }

    public likeOrDislikePost = async (
        input: LikeOrDislikePostInputDTO
    ): Promise<void> => {
        const { idToLikeOrDislike, token, like } = input

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

        const postWithCreatorDB = await this.postDatabase
            .findPostWithCreatorById(idToLikeOrDislike)

        if (!postWithCreatorDB) {
            throw new NotFoundError("'id' não encontrado")
        }

        const userId = payload.id
        const likeSQLite = like ? 1 : 0

        const likeDislikeDB: LikeDislikeDB = {
            user_id: userId,
            post_id: postWithCreatorDB.id,
            like: likeSQLite
        }

        const post = new Post(
            postWithCreatorDB.id,
            postWithCreatorDB.content,
            postWithCreatorDB.likes,
            postWithCreatorDB.dislikes,
            postWithCreatorDB.comments,
            postWithCreatorDB.created_at,
            postWithCreatorDB.updated_at,
            postWithCreatorDB.creator_id,
            postWithCreatorDB.creator_name
        )

        const likeDislikeExists = await this.postDatabase
            .findLikeDislike(likeDislikeDB)

        if (likeDislikeExists === POST_LIKE.ALREADY_LIKED) {
            if (like) {
                await this.postDatabase.removeLikeDislike(likeDislikeDB)
                post.removeLike()
            } else {
                await this.postDatabase.updateLikeDislike(likeDislikeDB)
                post.removeLike()
                post.addDislike()
            }

        } else if (likeDislikeExists === POST_LIKE.ALREADY_DISLIKED) {
            if (like) {
                await this.postDatabase.updateLikeDislike(likeDislikeDB)
                post.removeDislike()
                post.addLike()
            } else {
                await this.postDatabase.removeLikeDislike(likeDislikeDB)
                post.removeDislike()
            }

        } else {
            await this.postDatabase.likeOrDislikePost(likeDislikeDB)

            like ? post.addLike() : post.addDislike()
        }

        const updatedPlaylistDB = post.toDBModel()

        await this.postDatabase.update(idToLikeOrDislike, updatedPlaylistDB)
    }

}