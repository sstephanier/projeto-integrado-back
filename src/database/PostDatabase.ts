import { LikeDislikeDB, postDB, PostWithCreatorDB, POST_LIKE, UserDB } from "../types";
import { BaseDatabase } from "./BaseDatabase";

export class PostDatabase extends BaseDatabase {
  public static TABLE_POSTS = "posts";
  public static TABLE_USERS = "users"
  public static TABLE_LIKES_DISLIKES = "likes_dislikes";

  public getPostsWithCreators = async (): Promise<PostWithCreatorDB[]> => {
    const result: PostWithCreatorDB[] = await BaseDatabase.connection(
      PostDatabase.TABLE_POSTS
    )
      .select(
        "posts.id",
        "posts.creator_id",
        "posts.content",
        "posts.likes",
        "posts.dislikes",
        "posts.created_at",
        "posts.updated_at",
        "users.name AS creator_name"
      )
      .join("users", "posts.creator_id", "=", "users.id");

    return result;
  };

  public insert = async (postDB: postDB): Promise<void> => {
    await BaseDatabase.connection(PostDatabase.TABLE_POSTS).insert(postDB);
  };

  public findById = async (id: string): Promise<postDB | undefined> => {
    const result: postDB[] = await BaseDatabase.connection(
      PostDatabase.TABLE_POSTS
    )
      .select()
      .where({ id });

    return result[0];
  };

  public update = async (id: string, postDB: postDB): Promise<void> => {
    await BaseDatabase.connection(PostDatabase.TABLE_POSTS)
      .update(postDB)
      .where({ id });
  };

  public delete = async (id: string): Promise<void> => {
    await BaseDatabase.connection(PostDatabase.TABLE_POSTS)
      .delete()
      .where({ id });
  };

  public findPostWithCreatorById = async (
    postId: string
  ): Promise<PostWithCreatorDB | undefined> => {
    const result: PostWithCreatorDB[] = await BaseDatabase.connection(
      PostDatabase.TABLE_POSTS
    )
      .select(
        "posts.id",
        "posts.creator_id",
        "posts.content",
        "posts.likes",
        "posts.dislikes",
        "posts.created_at",
        "posts.updated_at",
        "users.name AS creator_name"
      )
      .join("users", "posts.creator_id", "=", "users.id")
      .where("posts.id", postId);

    return result[0];
  };

  public likeOrDislikePost = async (
    likeDislike: LikeDislikeDB
  ): Promise<void> => {
    await BaseDatabase.connection(PostDatabase.TABLE_LIKES_DISLIKES).insert(
      likeDislike
    );
  };

  public findLikeDislike = async (
    likeDislikeDBToFind: LikeDislikeDB
  ): Promise<POST_LIKE | null> => {
    const [likeDislikeDB]: LikeDislikeDB[] = await BaseDatabase.connection(
      PostDatabase.TABLE_LIKES_DISLIKES
    )
      .select()
      .where({
        user_id: likeDislikeDBToFind.user_id,
        post_id: likeDislikeDBToFind.post_id,
      });

    if (likeDislikeDB) {
      return likeDislikeDB.like === 1
        ? POST_LIKE.ALREADY_LIKED
        : POST_LIKE.ALREADY_DISLIKED;
    } else {
      return null;
    }
  };

  public removeLikeDislike = async (
    likeDislikeDB: LikeDislikeDB
  ): Promise<void> => {
    await BaseDatabase.connection(PostDatabase.TABLE_LIKES_DISLIKES)
      .delete()
      .where({
        user_id: likeDislikeDB.user_id,
        post_id: likeDislikeDB.post_id,
      });
  };

  public updateLikeDislike = async (likeDislikeDB: LikeDislikeDB) => {
    await BaseDatabase.connection(PostDatabase.TABLE_LIKES_DISLIKES)
      .update(likeDislikeDB)
      .where({
        user_id: likeDislikeDB.user_id,
        post_id: likeDislikeDB.post_id,
      });
  };

  public async getPostById(id: string) : Promise<PostWithCreatorDB | undefined> {
    const result: PostWithCreatorDB[] = await BaseDatabase
      .connection(PostDatabase.TABLE_POSTS)
      .where({ id: id })
    return result[0]
  }

  public async getUserById(id: string): Promise<UserDB> {
    const result: UserDB[] = await BaseDatabase
      .connection(PostDatabase.TABLE_USERS)
      .select()
      .where({ id })
    return result[0]
  }


}

