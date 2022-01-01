import { getRepository, getConnection } from 'typeorm';
import { Thumb } from '../typeorm/entity/Thumb';
import { User } from '../typeorm/entity/User';
import { validate } from 'class-validator';

import { IPost, ILikeIt, returnPostLikeIt, returnGetPostLikeIt, returnPost, returnPosts } from '../types/service/InterfacePost';
import { Post } from '../typeorm/entity/Post';



const likeItPost = async (likeItData: ILikeIt): Promise<returnPostLikeIt> => {
    try {
        const { postUuid, userUuid, likeIt } = likeItData
        const post = await Post.findOneOrFail({ uuid: postUuid })
        const user = await User.findOneOrFail({ uuid: userUuid })
        const thumbFindOne = await Thumb.findOne({ post, user })
        let message = ""
        if (thumbFindOne) {
            thumbFindOne.remove()
        }
        else {
            const thumb = Thumb.create({
                post,
                user,
                likeIt: true
            })
            const errors = await validate(thumb)
            if (errors.length > 0) throw errors
            await thumb.save()
        }
        return {
            success: true,
            message
        }
    } catch (err) {
        return {
            success: false,
            error: "Something went wrong"
        }
    }
}

const getLikeItPost = async (likeItData: { postUuid: string }): Promise<returnGetPostLikeIt> => {
    try {
        const { postUuid } = likeItData
        const post = await Post.findOneOrFail({ uuid: postUuid })
        const thumb = await getRepository(Thumb)
            .createQueryBuilder("thumb")
            .select("SUM(thumb.likeIt)", "likeItCount")
            .addSelect("count(*)", "countAll")
            .where("thumb.postIndex = :postIndex", { postIndex: post.index })
            .getRawOne();
        console.log(thumb)
        let likeItCount = 0
        let countAll = 0
        if (thumb.sum !== null) {
            likeItCount = parseInt(thumb.likeItCount)
            countAll = parseInt(thumb.countAll)
        }
        return {
            success: true,
            likeItCount,
            countAll
        }
    } catch (err) {
        return {
            success: false,
            error: "Something went wrong"
        }
    }
}




const createPost = async (postData: IPost): Promise<returnPost> => {
    const {
        title,
        content,
        ipAddress,
        id,
        category,
    } = postData;
    console.log(postData)
    try {
        const user = await User.findOneOrFail({ id })
        const post = Post.create({ title, content, ipAddress, user, category });
        const errors = await validate(post)
        if (errors.length > 0) throw errors
        await post.save()
        return {
            success: true,
        }
    } catch (err) {
        console.log(err)
        return {
            success: false,
            error: "Something went wrong"
        }
    }
}

const deletePost = async () => {

}

const updatePost = async () => {

}

const getPostFromUuid = async ({ postUuid }: { postUuid: string }): Promise<returnPost> => {
    try {
        console.log(postUuid)
        // const post = await Post.findOneOrFail({ uuid: postUuid })
        const post = await getRepository(Post)
            .createQueryBuilder("post")
            .leftJoin('post.user', 'user')
            .addSelect(['user.nickname'])
            .where("post.uuid = :uuid", { uuid: postUuid })
            .getOne();
        console.log(post)

        const postUpdate = await getConnection()
            .createQueryBuilder()
            .update(Post)
            .set({ views: () => "views + 1" })
            .where("uuid = :uuid", { uuid: postUuid })
            .execute();

        return {
            success: true,
            post
        }
    } catch (err) {
        console.error(err)
        return {
            success: false,
            error: "Something went wrong"
        }
    }
}


const getPostsWithoutNoticeBoardByTime = async ({ limit = "150" }: { limit: string }): Promise<returnPosts> => {
    try {
        const intLimit = parseInt(limit);
        console.log(limit, intLimit)
        const category = "noticeBoard";
        const posts = await getRepository(Post)
            .createQueryBuilder("post")
            .where("post.category != :category", { category })
            .select(["post.uuid", "post.title", "post.updatedAt", "post.category"])
            .leftJoin('post.user', 'user')
            .addSelect('user.nickname' as "nickname")
            .orderBy("post.createdAt", "DESC")
            .limit(intLimit)
            .getRawMany();
        console.log(posts)
        return {
            success: true,
            posts
        }
    } catch (err) {
        console.error(err)
        return {
            success: false,
            error: "getPostsWithoutNoticeBoardByTime db error"
        }
    }
}

const getPostsSortByTime = async ({ limit = "150" }: { limit: string }): Promise<returnPosts> => {
    try {
        const intLimit = parseInt(limit);
        const posts = await getRepository(Post)
            .createQueryBuilder("post")
            .select(["post.uuid", "post.title", "post.updatedAt", "post.category"])
            .leftJoin('post.user', 'user')
            .addSelect('user.nickname' as "nickname")
            .orderBy("post.createdAt", "DESC")
            .limit(intLimit)
            .getRawMany();
        console.log(posts)
        return {
            success: true,
            posts,
            error: null,
        }
    } catch (err) {
        console.error(err)
        return {
            success: false,
            error: "Something went wrong"
        }
    }
}

const getPostsPagenationSortByTime = async ({ category, page = 0, pageSize = 15 }: { category: string, page?: number, pageSize?: number }): Promise<returnPosts> => {
    try {
        let posts: Array<object> = []
        if (category) {
            await getRepository(Post)
                .createQueryBuilder("post")
                .select(["post.uuid", "post.title", "post.updatedAt", "post.category"])
                .where("post.category = :category", { category })
                .leftJoin('post.user', 'user')
                .addSelect('user.nickname' as "nickname")
                .skip((page - 1) * pageSize)
                .take(pageSize)
                .getRawMany();
            console.log(posts)
        }
        else {
            await getRepository(Post)
                .createQueryBuilder("post")
                .select(["post.uuid", "post.title", "post.updatedAt", "post.category"])
                .leftJoin('post.user', 'user')
                .addSelect('user.nickname' as "nickname")
                .skip((page - 1) * pageSize)
                .take(pageSize)
                .getRawMany();
            console.log(posts)
        }
        return {
            success: true,
            posts
        }
    } catch (err) {
        console.error(err)
        return {
            success: false,
            error: "Something went wrong"
        }
    }
}


const getCategoryPostsSortByTime = async ({ category, limit = "1500" }: { category: string, limit: string }): Promise<returnPosts> => {
    try {
        const intLimit = parseInt(limit);
        const posts = await getRepository(Post)
            .createQueryBuilder("post")
            .where("post.category = :category", { category })
            .leftJoin('post.user', 'user')
            .addSelect(['user.nickname'])
            .orderBy("post.createdAt", "DESC")
            .limit(intLimit)
            .getRawMany();
        return {
            success: true,
            posts
        }
    } catch (err) {
        console.error(err)
        return {
            success: false,
            error: "Something went wrong"
        }
    }
}


export {
    createPost,
    updatePost,
    deletePost,
    getPostFromUuid,
    getPostsSortByTime,
    getCategoryPostsSortByTime,
    getPostsPagenationSortByTime,
    getPostsWithoutNoticeBoardByTime,
    likeItPost,
    getLikeItPost,
}