import { CommentsModel } from "../types"

export interface GetCommentInputDTO {
    token: string | undefined
    post_id: string
}
export type GetCommentOutputDTO = CommentsModel[]

export interface CreateCommentsInputDTO {
    token: string |undefined
    post_id: unknown
    content: string
}
export interface EditCommentInputDTO {
    idToEdit: string,
    token: string |undefined,
    content: string
}
export interface DeleteCommentInputDTO {
    idToDelete: string,
    token: string |undefined
}
export interface LikeOrDislikeCommentInputDTO {
    idComment: string,
    token: string | undefined,
    like: unknown
}