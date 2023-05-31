export interface CommentsDB {
    id: string,
    creator_id: string,
    post_id: string,
    content: string,
    likes: number,
    dislikes: number,
    created_at: string,
    updated_at: string
  }
  
  export interface LikesDislikesCommentsDB {
    user_id: string,
    comments_id: string,
    like: number
  }
  export interface CommentWithCreatorDB extends CommentsDB {
    creator_name: string
  }
  export interface CommentsModel {
    id: string,
    content: string,
    likes: number,
    dislikes: number,
    createdAt: string,
    updatedAt: string,
    postId: string,
    creator: { 
        id: string,
        name: string
    }
  }
  
  export enum COMMENT_LIKE {
    ALREADY_LIKED = "ALREADY LIKED",
    ALREADY_DISLIKED = "ALREADY DISLIKED"
  }
  
  export enum USER_ROLES {
    NORMAL = "normal",
    ADMIN = "admin",
  }
  
  export interface TokenPayload {
    id: string;
    name: string;
    role: USER_ROLES;
  }
  
  export interface PostModel {
    id: string;
    content: string;
    likes: number;
    dislikes: number;
    createdAt: string;
    updatedAt: string;
    comments:number;
    creator: {
      id: string;
      name: string;
    };
  }
  
  export interface postDB {
    id: string;
    creator_id: string;
    content: string;
    likes: number;
    dislikes: number;
    comments: number;
    created_at: string;
    updated_at: string;
  }
  
  export interface UserDB {
    id: string;
    name: string;
    email: string;
    password: string;
    role: USER_ROLES;
    created_at: string;
  }
  
  export interface UserModel {
    id: string;
    name: string;
    email: string;
    password: string;
    role: USER_ROLES;
    createdAt: string;
  }
  export interface PostWithCreatorDB extends postDB {
    creator_name: string;
  }
  
  export interface LikeDislikeDB {
    user_id: string;
    post_id: string;
    like: number;
  }
  
  export enum POST_LIKE {
    ALREADY_LIKED = "ALREADY LIKED",
    ALREADY_DISLIKED = "ALREADY DISLIKED",
  }
  