import { CommentsDB, CommentsModel, USER_ROLES } from "../types"

export class Comment {
    constructor(
        private id: string,
        private content: string,
        private likes: number,
        private dislikes: number,
        private createdAt: string,
        private updatedAt: string,
        private postId: string,
        private creator: {
            id: string,
            name: string,
            role: USER_ROLES
        }
    ) {}

    public toDBModel(): CommentsDB {
        return {
            id: this.id,
            creator_id: this.creator.id,
            post_id: this.postId,
            content: this.content,
            likes: this.likes,
            dislikes: this.dislikes,
            created_at: this.createdAt,
            updated_at: this.updatedAt
        }
    }
    public toBusinessModel(): CommentsModel {
        return {
            id: this.id,
            content: this.content,
            likes: this.likes,
            dislikes: this.dislikes,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            postId: this.postId,
            creator: {
                id: this.id,
                name: this.creator.name
            }
        }
    }
    public getId(): string {
        return this.id
    }
    public setId(value: string): void {
        this.id = value
    }
    public getContent(): string {
        return this.content
    }
    public setContent(value: string): void {
        this.content = value
    }
    public getLikes(): number {
        return this.likes
    }
    public setLikes(value: number): void {
        this.likes = value
    }

    public addLike() {
        this.likes += 1
    }

    public removeLike() {
        this.likes -= 1
    }

    public addDislike() {
        this.dislikes += 1
    }

    public removeDislike() {
        this.dislikes -= 1
    }

    public getDislikes(): number {
        return this.dislikes
    }
    public setDislikes(value: number): void {
        this.dislikes = value
    }
    public getCreatedAt(): string {
        return this.createdAt
    }
    public setCreatedAt(value: string): void {
        this.createdAt = value
    }
    public getUpdateAt(): string {
        return this.updatedAt
    }
    public setUpdateAt(value: string): void {
        this.updatedAt = value
    }
    public getPostId(): string {
        return this.postId
    }
    public setPostId(value: string): void {
        this.postId = value
    }
    public getCreator(): {id: string, name:string}
    {return this.creator}
}